import React from 'react';
import CustomerChat from './CustomerChat';

interface ChatMessage {
  id: number;
  message: string;
  message_type: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  attachments?: Array<{
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
  }>;
}

interface ChatParticipant {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Chat {
  id: number;
  title: string;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
}

  chat: any;
}

export default function ShowChat({ chat }: Props) {
  const { t } = useTranslate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data, setData, post, processing, reset, errors } = useForm({
    message: '',
    attachments: [] as File[],
  });

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.message.trim() && selectedFiles.length === 0) {
      toast.error(t('Please enter a message or attach a file'));
      return;
    }

    const formData = new FormData();
    formData.append('message', data.message);
    
    selectedFiles.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    post(route('customer.communications.chats.messages.store', chat.id), {
      data: formData,
      onSuccess: () => {
        reset();
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success(t('Message sent successfully'));
      },
      onError: () => {
        toast.error(t('Failed to send message'));
      },
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <CustomerLayout>
      <Head title={`Chat - ${chat.title}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={route('customer.communications.chats')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('Back to Chats')}
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {chat.title}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <Badge className={getStatusColor(chat.status)}>
                  {t(chat.status.charAt(0).toUpperCase() + chat.status.slice(1))}
                </Badge>
                  return <CustomerChat chat={chat} />;
            </Link>
