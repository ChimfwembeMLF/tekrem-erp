import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Users,
  DollarSign,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { Project, ProjectMilestone } from '@/types';
import useRoute from '@/Hooks/useRoute';

interface AIInsightsProps {
  project: Project;
  milestones?: ProjectMilestone[];
}

interface AIInsight {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  recommendation?: string;
  confidence: number;
}

const insightConfig = {
  success: { icon: <CheckCircle className="h-5 w-5 text-green-600" />, badge: 'bg-green-100 text-green-800' },
  warning: { icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />, badge: 'bg-yellow-100 text-yellow-800' },
  error: { icon: <AlertTriangle className="h-5 w-5 text-red-600" />, badge: 'bg-red-100 text-red-800' },
  info: { icon: <Lightbulb className="h-5 w-5 text-blue-600" />, badge: 'bg-blue-100 text-blue-800' },
};

export default function AIInsights({ project, milestones = [] }: AIInsightsProps) {
  const route = useRoute()
  // Get CSRF token from meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

const generateInsights = async () => {
  setIsGenerating(true);
  try {
    const { data } = await axios.post(
      route('projects.ai-milestones', { project: project.id }),
      { project, milestones },
      { headers: { 'X-CSRF-TOKEN': csrfToken } }
    );
    setInsights(data);
  } catch (err) {
    console.error(err);
  } finally {
    setIsGenerating(false);
  }
};

const handleCustomAnalysis = async () => {
  if (!customPrompt.trim()) return;
  setIsGenerating(true);
  try {
    const { data } = await axios.post(
      route('projects.ai-insights', { project: project.id }),
      { project, query: customPrompt },
      { headers: { 'X-CSRF-TOKEN': csrfToken } }
    );
    setInsights(prev => [ ...data, ...prev ]);
    setCustomPrompt('');
  } catch (err) {
    console.error(err);
  } finally {
    setIsGenerating(false);
  }
};


  const budgetUsed = project.budget && project.spent_amount
    ? Math.round((project.spent_amount / project.budget) * 100) + '%'
    : 'N/A';

  return (
    <Card aria-busy={isGenerating}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Project Insights
        </CardTitle>
        <CardDescription>
          AI-powered analysis and recommendations for your project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generate Insights Button */}
        <div className="flex gap-2">
          <Button
            onClick={generateInsights}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate AI Insights
              </>
            )}
          </Button>
        </div>

        {/* Custom Analysis */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ask AI about your project:</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="e.g., What are the main risks for this project? How can we improve team efficiency?"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button
              onClick={handleCustomAnalysis}
              disabled={isGenerating || !customPrompt.trim()}
              variant="outline"
            >
              Ask AI
            </Button>
          </div>
        </div>

        {/* Insights Display */}
        {insights.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">AI Analysis Results</h4>
            {insights.map((insight, index) => {
              const { icon, badge } = insightConfig[insight.type] || {};
              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {icon}
                      <h5 className="font-medium">{insight.title}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={badge}>{insight.type}</Badge>
                      <Badge variant="secondary">{insight.confidence}% confidence</Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{insight.description}</p>

                  {insight.recommendation && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Recommendation:</strong> {insight.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Project Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1"><Target className="h-4 w-4 text-blue-600" /></div>
            <div className="text-sm font-medium">{project.progress}%</div>
            <div className="text-xs text-gray-600">Progress</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1"><Clock className="h-4 w-4 text-orange-600" /></div>
            <div className="text-sm font-medium">{project.deadline || 'N/A'}</div>
            <div className="text-xs text-gray-600">Days Left</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1"><DollarSign className="h-4 w-4 text-green-600" /></div>
            <div className="text-sm font-medium">{budgetUsed}</div>
            <div className="text-xs text-gray-600">Budget Used</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1"><Users className="h-4 w-4 text-purple-600" /></div>
            <div className="text-sm font-medium">{project.team_members?.length || 0}</div>
            <div className="text-xs text-gray-600">Team Size</div>
          </div>
        </div>

        {insights.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Click "Generate AI Insights" to get AI-powered analysis of your project.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
