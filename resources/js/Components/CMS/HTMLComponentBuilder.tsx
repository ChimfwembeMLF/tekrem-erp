import React, { useState } from 'react';
import { HTML_COMPONENTS, COMPONENT_CATEGORIES, getComponentsByCategory } from './HTMLComponentLibrary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { X, Copy, Edit2, Eye, Code, ChevronUp, ChevronDown } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  html: string;
  order: number;
}

interface Props {
  value: Component[];
  onChange: (components: Component[]) => void;
}

export default function HTMLComponentBuilder({ value = [], onChange }: Props) {
  const [components, setComponents] = useState<Component[]>(value);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const addComponent = (componentId: string) => {
    const libraryComponent = Object.values(HTML_COMPONENTS).find(c => c.id === componentId);
    if (!libraryComponent) return;

    const newComponent: Component = {
      id: `${componentId}-${Date.now()}`,
      name: libraryComponent.name,
      html: libraryComponent.html,
      order: components.length,
    };

    const updated = [...components, newComponent];
    setComponents(updated);
    onChange(updated);
  };

  const removeComponent = (index: number) => {
    const updated = components.filter((_, i) => i !== index);
    setComponents(updated);
    onChange(updated);
  };

  const duplicateComponent = (index: number) => {
    const component = components[index];
    const newComponent: Component = {
      ...component,
      id: `${component.id}-${Date.now()}`,
    };
    const updated = [...components.slice(0, index + 1), newComponent, ...components.slice(index + 1)];
    setComponents(updated);
    onChange(updated);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...components];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setComponents(updated);
    onChange(updated);
  };

  const moveDown = (index: number) => {
    if (index >= components.length - 1) return;
    const updated = [...components];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setComponents(updated);
    onChange(updated);
  };

  const updateComponentHtml = (index: number, html: string) => {
    const updated = [...components];
    updated[index].html = html;
    setComponents(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Component Library</TabsTrigger>
          <TabsTrigger value="builder">
            Builder ({components.length})
          </TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Component Library */}
        <TabsContent value="library" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click components to add them to your page. Drag and reorder in the builder tab.
          </p>
          {Object.entries(COMPONENT_CATEGORIES).map(([key, label]) => {
            const categoryComponents = getComponentsByCategory(key);
            return (
              <div key={key}>
                <h3 className="font-semibold mb-3">{label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categoryComponents.map(comp => (
                    <Card
                      key={comp.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => addComponent(comp.id)}
                    >
                      <CardContent className="p-4">
                        <div className="text-2xl mb-2">{comp.icon}</div>
                        <div className="font-semibold text-sm">{comp.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{comp.preview}</div>
                        <Button size="sm" className="mt-3 w-full">
                          + Add
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* Builder */}
        <TabsContent value="builder" className="space-y-4">
          {components.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No components added yet</p>
                <p className="text-sm text-muted-foreground">Go to "Component Library" to add components</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {components.map((component, index) => (
                <Card
                  key={component.id}
                  className={`cursor-pointer transition-colors ${
                    selectedIndex === index ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{index + 1}. {component.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {component.html.substring(0, 80)}...
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewId(component.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateComponent(index);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveUp(index);
                          }}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveDown(index);
                          }}
                          disabled={index === components.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeComponent(index);
                          }}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Edit HTML for selected component */}
                    {selectedIndex === index && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        <label className="block text-sm font-medium">Edit HTML</label>
                        <textarea
                          value={component.html}
                          onChange={(e) => updateComponentHtml(index, e.target.value)}
                          className="w-full p-3 border rounded font-mono text-sm"
                          rows={8}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <p className="text-xs text-muted-foreground">
                          <Code className="inline h-3 w-3 mr-1" />
                          Edit the HTML code directly to customize this component
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="space-y-4">
          {components.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No components to preview</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-white">
              <div
                className="w-full"
                dangerouslySetInnerHTML={{
                  __html: components.map(c => c.html).join('\n'),
                }}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
