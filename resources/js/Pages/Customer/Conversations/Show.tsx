import React from 'react';
import Conversation from '../../CRM/LiveChat/Conversation';
import { PageProps } from '@/types';

interface CustomerConversationShowProps extends PageProps {
  conversation: any;
  messages: any[];
}

const CustomerConversationShow: React.FC<CustomerConversationShowProps> = ({ conversation, messages }) => {
  return (
    <Conversation
      conversation={conversation}
      messages={messages}
      isCustomerView={true}
    />
  );
};

export default CustomerConversationShow;
