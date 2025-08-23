import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { NewGiftForm } from '../types';
import { SUPPORTED_TOKENS, ETH_TOKEN } from '../services/tokens';
import { useTokenBalance } from '../services/tokenService';
import { useGiftTransaction } from '../services/contractService';

export const NewTab: React.FC = () => {
  const { isConnected } = useAccount();
  
  const [formData, setFormData] = useState<NewGiftForm>({
    title: '',
    recipientType: 'specific',
    recipients: [''],
    token: ETH_TOKEN,
    amount: '',
    description: ''
  });

  const tokenBalance = useTokenBalance(formData.token);
  const { sendGift, isPending, isConfirming, isConfirmed, error } = useGiftTransaction();

  // 自动消失成功弹窗
  useEffect(() => {
    if (isConfirmed) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 4000); // 4秒后自动消失，让用户看完烟花效果

      return () => clearTimeout(timer);
    }
  }, [isConfirmed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) return;
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;
    if (formData.recipientType === 'specific' && !formData.recipients.some(r => r.trim())) return;
    
    // Check balance
    if (tokenBalance) {
      const inputAmount = parseFloat(formData.amount);
      const availableBalance = parseFloat(tokenBalance.balance) / Math.pow(10, formData.token.decimals);
      if (inputAmount > availableBalance) return;
    }

    await sendGift(formData);
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({ ...prev, title: value }));
  };

  const handleRecipientTypeChange = (type: 'specific' | 'everyone') => {
    setFormData(prev => ({ 
      ...prev, 
      recipientType: type,
      recipients: type === 'everyone' ? [] : ['']
    }));
  };

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...formData.recipients];
    newRecipients[index] = value;
    setFormData(prev => ({ ...prev, recipients: newRecipients }));
  };

  const addRecipient = () => {
    setFormData(prev => ({ 
      ...prev, 
      recipients: [...prev.recipients, ''] 
    }));
  };

  const removeRecipient = (index: number) => {
    if (formData.recipients.length > 1) {
      const newRecipients = formData.recipients.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, recipients: newRecipients }));
    }
  };

  const handleTokenChange = (tokenAddress: string) => {
    const token = SUPPORTED_TOKENS.find(t => t.address === tokenAddress);
    if (token) {
      setFormData(prev => ({ ...prev, token }));
    }
  };

  const handleAmountChange = (value: string) => {
    setFormData(prev => ({ ...prev, amount: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  if (!isConnected) {
    return (
      <div className="new-tab">
        <div className="connect-prompt">
          <h2>Connect Wallet</h2>
          <p>Please connect your wallet to send gifts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="new-tab">
      <form onSubmit={handleSubmit} className="gift-form">
        <div className="form-group">
          <label htmlFor="title">Gift Title</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter gift title"
            required
          />
        </div>

        <div className="form-group">
          <label>Send To</label>
          <div className="recipient-type-selector">
            <button
              type="button"
              className={formData.recipientType === 'specific' ? 'active' : ''}
              onClick={() => handleRecipientTypeChange('specific')}
            >
              Specific Recipients
            </button>
            <button
              type="button"
              className={formData.recipientType === 'everyone' ? 'active' : ''}
              onClick={() => handleRecipientTypeChange('everyone')}
            >
              Everyone
            </button>
          </div>
        </div>

        {formData.recipientType === 'specific' && (
          <div className="form-group">
            <label>Recipients</label>
            <div className="recipients-list">
              {formData.recipients.map((recipient, index) => (
                <div key={index} className="recipient-input-group">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => handleRecipientChange(index, e.target.value)}
                    placeholder="0x..."
                    required
                  />
                  {formData.recipients.length > 1 && (
                    <button
                      type="button"
                      className="remove-recipient"
                      onClick={() => removeRecipient(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-recipient"
                onClick={addRecipient}
              >
                + Add Recipient
              </button>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Amount</label>
          <div className="amount-input-group">
            <select
              className="token-selector"
              value={formData.token.address}
              onChange={(e) => handleTokenChange(e.target.value)}
            >
              {SUPPORTED_TOKENS.map(token => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <div className="amount-input-wrapper">
              <input
                type="number"
                className="amount-input"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={tokenBalance && !formData.amount ? `Balance: ${tokenBalance.formatted}` : "0.0"}
                step="0.000001"
                min="0"
                required
              />
              {tokenBalance && formData.amount && parseFloat(formData.amount) > parseFloat(tokenBalance.balance) / Math.pow(10, formData.token.decimals) && (
                <div className="amount-error">
                  Insufficient balance
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Add a message to your gift"
            rows={3}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isPending || isConfirming}
        >
          {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Send Gift'}
        </button>

        {isConfirmed && (
          <div className="success-overlay">
            <div className="success-modal">
              <div className="success-decoration">
                <div className="firework-particle">✨</div>
                <div className="firework-particle">💫</div>
                <div className="firework-particle">⭐</div>
                <div className="firework-particle">🌟</div>
                <div className="firework-particle">💥</div>
                <div className="firework-particle">✨</div>
                <div className="firework-particle">💫</div>
                <div className="firework-particle">⭐</div>
                <div className="firework-particle">🌟</div>
                <div className="firework-particle">💥</div>
                <div className="firework-particle">✨</div>
                <div className="firework-particle">💫</div>
              </div>
              <h2 className="success-title">Gift sent successfully!</h2>
            </div>
          </div>
        )}

        {error && (
          <div className="transaction-error">
            Error: {error.message}
          </div>
        )}
      </form>
    </div>
  );
};
