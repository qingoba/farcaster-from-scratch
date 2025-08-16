import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import presentABI from './Present.abi.ts'
import { parseEther } from "viem";

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <>
      <div>Mini App + Vite + TS + React + Wagmi</div>
      <ConnectMenu />
    </>
  );
}

function ConnectMenu() {
  const { isConnected, address, chain } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  if (isConnected) {
    return (
      <>
        <div>Connected account:</div>
        <div>{address}</div>
        <div>Coonected chain: {chain?.name}</div>
        <div>Balance: {balance ? `${parseFloat(balance.formatted).toFixed(6)} ${balance.symbol}` : 'Loading...'}</div>
        <div style={{ 
          marginTop: '20px', 
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <SwitchNetworkButton />
          <DisconnectButton />
          <SignButton />
          <WarpPresent />
          <UnwarpPresent />
        </div>
      </>
    );
  }

  return <ConnectButton />;
}

function ConnectButton() {
  const { connect, connectors } = useConnect();
  const [showConnectors, setShowConnectors] = useState(false);
  
  const handleConnect = () => {
    console.log("Showing connectors");
    setShowConnectors(true);
  };

  if (showConnectors) {
    return (
      <div>
        <div style={{ marginBottom: '10px' }}>选择钱包：</div>
        {connectors.map((connector) => (
          <button 
            key={connector.id} 
            onClick={() => {
              connect({ connector });
              setShowConnectors(false);
            }}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              marginRight: '8px',
              marginBottom: '8px',
              width: '100%'
            }}
          >
            {connector.name || connector.id}
          </button>
        ))}
        <button 
          onClick={() => setShowConnectors(false)}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#9E9E9E', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            width: '100%'
          }}
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={handleConnect}>
      Connect
    </button>
  );
}

function SwitchNetworkButton() {
  const { chains, switchChain } = useSwitchChain();
  const [showNetworkList, setShowNetworkList] = useState(false);
  
  const handleSwitchNetwork = () => {
    console.log('Switch network clicked');
    setShowNetworkList(true);
  };

  if (showNetworkList) {
    return (
      <div>
        <div style={{ marginBottom: '10px' }}>选择网络：</div>
        {chains.map((chain) => (
          <button 
            key={chain.id} 
            onClick={() => {
              switchChain({ chainId: chain.id });
              setShowNetworkList(false);
            }}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              marginRight: '8px',
              marginBottom: '8px'
            }}
          >
            {chain.name}
          </button>
        ))}
        <button 
          onClick={() => setShowNetworkList(false)}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#9E9E9E', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer'
          }}
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <button 
      type="button" 
      onClick={handleSwitchNetwork}
      style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}
    >
      Switch Network
    </button>
  );
}

function DisconnectButton() {
  const { disconnect } = useDisconnect()
  const handleDisconnect = () => {
    // 在这里添加断开连接的具体逻辑
    disconnect();
    console.log('Disconnect clicked');
    alert('Disconnect button clicked!'); // 添加alert来测试按钮是否工作
    // 例如：调用wagmi的disconnect函数
    // 例如：清除本地存储
    // 例如：重置应用状态
  };

  return (
    <button 
      type="button" 
      onClick={handleDisconnect}
      style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}
    >
      Disconnect
    </button>
  );
}

function SignButton() {
  const { signMessage, isPending, data, error } = useSignMessage();

  const handleSignMessage = () => {
    console.log("Signing message");
    signMessage({ message: "hello world" });
  };
  return (
    <>
      <button 
        type="button" 
        onClick={handleSignMessage}
        style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}
        disabled={isPending}
      >
        {isPending ? "Signing..." : "Sign message"}
      </button>
      {data && (
        <>
          <div>Signature</div>
          <div>{data}</div>
        </>
      )}
      {error && (
        <>
          <div>Error</div>
          <div>{error.message}</div>
        </>
      )}
    </>
  );
}

function WarpPresent() 
{
  const { address } = useAccount();
  const [showForm, setShowForm] = useState(false);
  const [recipients, setRecipients] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [presentID, setPresentID] = useState<string | null>(null);
  
  const { writeContract, isPending, data: hash, error } = useWriteContract();

  // 等待交易收据
  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({
    hash: hash,
  });

  // 当交易成功时解析事件
  useEffect(() => {
    if (isSuccess && receipt) {
      // 查找特定事件
      const presentEvent = receipt.logs.find(log => {
        // 根据事件签名或地址过滤
        return log.topics[0] === "0xf57d75a06786ec46ba529c7c6a4a8c5f0c1eae07a3a01fa6c75da0320a9f7588" // 你的事件签名
      });
      
      if (presentEvent && presentEvent.topics[1]) {
        const presentIDFromEvent = presentEvent.topics[1];
        setPresentID(presentIDFromEvent);
      }
    }
  }, [isSuccess, receipt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipientArray = recipients.split(",").map(addr => addr.trim());
    
    writeContract({
      address: "0x3B3cF7ee8dbCDDd8B8451e38269D982F351ca3db",
      abi: presentABI,
      functionName: "wrapPresent",
      args: [recipientArray, [{ tokens: "0x0000000000000000000000000000000000000000", amounts: BigInt(parseEther(amount)) }]],
      value: BigInt(parseEther(amount))
    });
  };

  if (showForm) {
    return (
      <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label>接收地址 (用逗号分隔):</label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="0x1234...,0x5678..."
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>金额 (ETH):</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="submit" 
              disabled={isPending}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              {isPending ? "交易中..." : "发送交易"}
            </button>
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#9E9E9E', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              取消
            </button>
          </div>
        </form>
        
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            错误: {error.message}
          </div>
        )}
        
        {hash && (
          <div style={{ color: 'green', marginTop: '10px' }}>
            交易哈希: {hash}
            {presentID && (
              <div style={{ marginTop: '5px' }}>
                Present ID: {presentID}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <button 
      onClick={() => setShowForm(true)}
      style={{ 
        padding: '8px 16px', 
        backgroundColor: '#FF9800', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        marginBottom: '10px' 
      }}
    >
      Warp Present
    </button>
  );
}

function UnwarpPresent() {
  const { address } = useAccount();
  const [showForm, setShowForm] = useState(false);
  const [presentID, setPresentID] = useState("");
  
  const { writeContract, isPending, data: hash, error } = useWriteContract();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    writeContract({
      address: "0x3B3cF7ee8dbCDDd8B8451e38269D982F351ca3db",
      abi: presentABI,
      functionName: "unwrapPresent",
      args: [presentID],
    });
  };

  if (showForm) {
    return (
      <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label>礼物 ID:</label>
            <input
              type="text"
              value={presentID}
              onChange={(e) => setPresentID(e.target.value)}
              placeholder="0x6fbfc22e08bf9b8489c1a58e5923d169f41f7cd469524c6918ae0138e1523f95"
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="submit" 
              disabled={isPending}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              {isPending ? "交易中..." : "拆开礼物"}
            </button>
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#9E9E9E', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              取消
            </button>
          </div>
        </form>
        
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            错误: {error.message}
          </div>
        )}
        
        {hash && (
          <div style={{ color: 'green', marginTop: '10px' }}>
            交易哈希: {hash}
          </div>
        )}
      </div>
    );
  }

  return (
    <button 
      onClick={() => setShowForm(true)}
      style={{ 
        padding: '8px 16px', 
        backgroundColor: '#9C27B0', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        marginBottom: '10px' 
      }}
    >
      UnWarp Present
    </button>
  );
}

export default App;
