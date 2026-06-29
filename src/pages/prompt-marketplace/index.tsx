import { useCallback, useEffect, useState } from 'react';
import { useIntl } from '@umijs/max';
import {
  Button,
  Card,
  Drawer,
  Empty,
  Input,
  message,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  StarOutlined,
  StarFilled,
  SendOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import {
  listPromptMarketplace,
  listFavorites,
  toggleFavorite,
  usePrompt as applyPromptTemplate,
  saveGeneratedPrompt,
  generatePromptStream,
} from '@/services/promptMarketplaceService';
import type { PromptTemplate } from '@/types/promptMarketplace';
import styles from './index.less';

const { TextArea } = Input;
const { Paragraph } = Typography;

interface PromptMarketplacePageProps {
  open: boolean;
  onClose: () => void;
  agentName: string;
}

export default function PromptMarketplacePage({ open, onClose, agentName }: PromptMarketplacePageProps) {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState('marketplace');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [generateDescription, setGenerateDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [saveName, setSaveName] = useState('');

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPromptMarketplace({
        category: selectedCategory ?? undefined,
        keyword: keyword || undefined,
      });
      setTemplates(res.items ?? []);
      setCategories(res.categories ?? []);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, keyword]);

  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await listFavorites();
      setFavoriteIds(new Set(favorites.map((item) => item.templateId)));
    } catch {
      setFavoriteIds(new Set());
    }
  }, []);

  useEffect(() => {
    if (open) {
      void fetchTemplates();
      void loadFavorites();
    }
  }, [open, fetchTemplates, loadFavorites]);

  const handleToggleFavorite = async (templateId: number) => {
    try {
      const res = await toggleFavorite({ templateId });
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (res.favorited) {
          next.add(templateId);
        } else {
          next.delete(templateId);
        }
        return next;
      });
    } catch {
      message.error('收藏操作失败');
    }
  };

  const handleUsePrompt = async (template: PromptTemplate) => {
    if (!agentName) {
      message.error('请先选择目标 Agent');
      return;
    }
    try {
      await applyPromptTemplate({ templateId: template.id, agentName });
      message.success(`已选用「${template.name}」到 ${agentName}`);
      onClose();
    } catch {
      message.error('选用失败，请确认 Agent 已注册');
    }
  };

  const handleGenerate = async () => {
    if (!generateDescription.trim()) return;
    setGenerating(true);
    setGeneratedContent('');
    setEditableContent('');
    try {
      await generatePromptStream(generateDescription, (chunk) => {
        setGeneratedContent((prev) => {
          const next = prev + chunk;
          setEditableContent(next);
          return next;
        });
      });
    } catch {
      message.error('生成失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveGenerated = async () => {
    if (!saveName.trim() || !editableContent.trim()) return;
    try {
      await saveGeneratedPrompt({
        name: saveName,
        content: editableContent,
      });
      message.success('模板已保存');
      setSaveName('');
      setEditableContent('');
      setGeneratedContent('');
      setGenerateDescription('');
      setActiveTab('marketplace');
      void fetchTemplates();
    } catch {
      message.error('保存失败');
    }
  };

  const filteredTemplates = showFavoritesOnly
    ? templates.filter((t) => favoriteIds.has(t.id))
    : templates;

  return (
    <Drawer
      title={intl.formatMessage({ id: 'promptMarketplace.title', defaultMessage: 'Prompt 市场' })}
      width={720}
      open={open}
      onClose={onClose}
      className={styles.drawer}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'marketplace',
            label: intl.formatMessage({ id: 'promptMarketplace.tab.marketplace', defaultMessage: '模板市场' }),
            children: (
              <div className={styles.marketplaceTab}>
                <div className={styles.filterBar}>
                  <Select
                    allowClear
                    placeholder="分类筛选"
                    style={{ width: 140 }}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    options={categories.map((c) => ({ label: c, value: c }))}
                  />
                  <Input.Search
                    placeholder="搜索模板"
                    allowClear
                    style={{ width: 200 }}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onSearch={(value) => setKeyword(value.trim())}
                  />
                  <Button
                    type={showFavoritesOnly ? 'primary' : 'default'}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  >
                    <StarFilled /> 我的收藏
                  </Button>
                </div>
                <Spin spinning={loading}>
                  {filteredTemplates.length === 0 ? (
                    <Empty description="暂无模板" />
                  ) : (
                    <div className={styles.templateGrid}>
                      {filteredTemplates.map((tpl) => (
                        <Card
                          key={tpl.id}
                          size="small"
                          className={styles.templateCard}
                          title={
                            <Space>
                              <span>{tpl.name}</span>
                              <Tag>{tpl.category}</Tag>
                            </Space>
                          }
                          extra={
                            <Tooltip title={favoriteIds.has(tpl.id) ? '取消收藏' : '收藏'}>
                              <Button
                                type="text"
                                size="small"
                                icon={favoriteIds.has(tpl.id) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                                onClick={() => void handleToggleFavorite(tpl.id)}
                              />
                            </Tooltip>
                          }
                          actions={[
                            <Button
                              key="use"
                              type="link"
                              size="small"
                              icon={<SendOutlined />}
                              onClick={() => void handleUsePrompt(tpl)}
                            >
                              使用
                            </Button>,
                          ]}
                        >
                          <Paragraph ellipsis={{ rows: 2 }} type="secondary">
                            {tpl.description || tpl.content.slice(0, 100)}
                          </Paragraph>
                          <div className={styles.tags}>
                            {tpl.tags.slice(0, 3).map((tag) => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Spin>
              </div>
            ),
          },
          {
            key: 'generate',
            label: (
              <span>
                <RobotOutlined /> AI 生成
              </span>
            ),
            children: (
              <div className={styles.generateTab}>
                <Input
                  placeholder="描述你需要的 Prompt，如「帮我写一个代码审查助手」"
                  value={generateDescription}
                  onChange={(e) => setGenerateDescription(e.target.value)}
                  onPressEnter={() => void handleGenerate()}
                  suffix={
                    <Button
                      type="primary"
                      size="small"
                      icon={<RobotOutlined />}
                      loading={generating}
                      onClick={() => void handleGenerate()}
                    >
                      生成
                    </Button>
                  }
                />
                {generating || generatedContent ? (
                  <div className={styles.generatePreview}>
                    <TextArea
                      rows={10}
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      placeholder="生成的 Prompt 将在此显示，可直接编辑..."
                    />
                    {editableContent ? (
                      <div className={styles.generateActions}>
                        <Input
                          placeholder="模板名称"
                          value={saveName}
                          onChange={(e) => setSaveName(e.target.value)}
                          style={{ width: 200 }}
                        />
                        <Button type="primary" onClick={() => void handleSaveGenerated()}>
                          保存为模板
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  );
}
