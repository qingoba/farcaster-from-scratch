import React, { useState } from 'react';

export const NewTab: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    to: '',
    amount: '',
    description: '',
    limit: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contract interaction
    console.log('Sending gift:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const isEveryoneGift = formData.to.toLowerCase() === 'everyone';

  return (
    <div className="new-tab">
      <h2>Send a Gift</h2>
      
      <form onSubmit={handleSubmit} className="gift-form">
        <div className="form-group">
          <label htmlFor="title">Gift Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter gift title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="to">Send To</label>
          <input
            type="text"
            id="to"
            name="to"
            value={formData.to}
            onChange={handleChange}
            placeholder="Address or 'everyone'"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (ETH)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.1"
            step="0.001"
            min="0"
            required
          />
        </div>

        {isEveryoneGift && (
          <div className="form-group">
            <label htmlFor="limit">Limit (number of recipients)</label>
            <input
              type="number"
              id="limit"
              name="limit"
              value={formData.limit}
              onChange={handleChange}
              placeholder="10"
              min="1"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add a message to your gift"
            rows={3}
          />
        </div>

        <button type="submit" className="submit-button">
          Send Gift
        </button>
      </form>
    </div>
  );
};
