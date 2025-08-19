# Live Gifts 查询调用链

## 完整调用流程

### 1. 用户触发 (UI层)
```
用户操作 → ExploreTab.tsx
├── 页面加载时: useEffect in AppContext
├── 点击刷新: refreshGifts()
└── 切换到Live模式: setExploreMode('live')
```

### 2. Context 层 (AppContext.tsx)
```typescript
// 初始加载
useEffect(() => {
  fetchGifts(); // 组件挂载时自动调用
}, []);

// 手动刷新
const refreshGifts = async () => {
  giftService.clearCache();  // 清除缓存
  await fetchGifts();        // 重新获取
};

// 核心获取函数
const fetchGifts = async () => {
  setLoading(true);
  const allGifts = await giftService.getAllGifts(); // 调用服务层
  setGifts(allGifts);
  setLoading(false);
};
```

### 3. 服务层 (giftService.ts)
```typescript
// 获取所有礼物
async getAllGifts() {
  const [liveGifts, historicGifts] = await Promise.all([
    this.getLiveGifts(),      // 获取Live礼物
    this.getHistoricGifts()   // 获取Historic礼物(未实现)
  ]);
  return [...liveGifts, ...historicGifts];
}

// 获取Live礼物
async getLiveGifts() {
  // 检查缓存 (5分钟有效期)
  if (cache.valid) return cache.data;
  
  // 调用区块链服务
  const gifts = await blockchainService.fetchLiveGifts();
  
  // 更新缓存
  this.liveGiftsCache = gifts;
  return gifts;
}
```

### 4. 区块链层 (blockchain.ts)

#### 4.1 主入口函数
```typescript
async fetchLiveGifts(): Promise<Gift[]> {
  // 1. 获取WrapPresent事件
  const events = await this.fetchWrapPresentEvents();
  
  // 2. 并行获取每个礼物的详细信息
  const presentPromises = events.map(async (event) => {
    const details = await this.getPresentDetails(event.presentId);
    const nftImage = await this.getNFTImage(event.presentId);
    // 构造Gift对象
    return gift;
  });
  
  // 3. 处理结果
  const presents = await Promise.all(presentPromises);
  return presents
    .filter(p => p !== null && p.status === 0) // 只要活跃礼物
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)) // 按金额排序
    .slice(0, 50); // 取前50个
}
```

#### 4.2 事件查询函数
```typescript
async fetchWrapPresentEvents(): Promise<WrapPresentEvent[]> {
  const currentBlock = await this.getCurrentBlock();
  const fromBlock = currentBlock - 2000000n; // 一周前
  
  // 策略1: 尝试单次大查询
  try {
    return await this.fetchEventsBatch(fromBlock, currentBlock, 1);
  } catch (error) {
    // 策略2: 分批查询 (20000块/批次)
    // 创建并行批次请求
    // 合并所有结果
  }
}
```

#### 4.3 单批次事件查询
```typescript
async fetchEventsBatch(fromBlock, toBlock, batchNumber) {
  const logs = await publicClient.getLogs({
    address: PRESENT_CONTRACT_ADDRESS,
    event: parseAbiItem('event WrapPresent(bytes32 indexed presentId, address sender)'),
    fromBlock,
    toBlock
  });
  
  return logs.map(log => ({
    presentId: log.topics[1],  // 礼物ID
    sender: log.args.sender,   // 发送者
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash
  }));
}
```

#### 4.4 礼物详情查询
```typescript
async getPresentDetails(presentId): Promise<PresentData> {
  const result = await publicClient.readContract({
    address: PRESENT_CONTRACT_ADDRESS,
    abi: presentAbi,
    functionName: 'getPresent',
    args: [presentId]
  });
  
  return {
    sender: result[0],      // 发送者
    recipients: result[1],  // 接收者列表
    content: result[2],     // 资产内容 [{tokens, amounts}]
    title: result[3],       // 标题
    description: result[4], // 描述
    status: result[5],      // 状态 (0=活跃)
    expiryAt: result[6]     // 过期时间
  };
}
```

## 关键配置参数

```typescript
// 合约地址
const PRESENT_CONTRACT_ADDRESS = '0x3B3cF7ee8dbCDDd8B8451e38269D982F351ca3db';

// 查询参数
const BLOCKS_PER_BATCH = 20000;    // 每批次区块数
const ONE_WEEK_BLOCKS = 2000000;   // 一周的区块数
const CACHE_DURATION = 5 * 60 * 1000; // 缓存5分钟

// RPC配置
transport: http('/api/rpc') // 通过Vite代理访问Arbitrum Sepolia
```

## 数据流转

```
WrapPresent事件 → presentId → getPresent(presentId) → Gift对象
├── presentId: 礼物唯一标识
├── sender: 发送者地址  
├── recipients: 接收者列表
├── content: [{tokens: "0x0", amounts: "1000000000000000000"}] // 1 ETH
├── title: "生日快乐!"
├── description: "祝你生日快乐"
├── status: 0 (活跃状态)
└── nftImage: 占位图片URL
```

## 性能优化策略

1. **缓存机制**: 5分钟内复用数据
2. **并行查询**: 事件查询和详情获取都并行执行
3. **智能分批**: 先尝试大查询，失败后自动分批
4. **数据过滤**: 只处理活跃状态的礼物
5. **结果限制**: 只返回价值前50的礼物

## 错误处理

- 网络错误 → 回退到模拟数据
- RPC限制 → 自动分批重试
- 合约调用失败 → 跳过该礼物
- 超时 → 使用缓存数据
