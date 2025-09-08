import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/use-admin";
import LoginModal from "@/components/admin/login-modal";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const { admin, isLoading, logout } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Установка",
    imageUrl: "",
    published: false,
  });

  useEffect(() => {
    // Track pageview
    fetch("/api/stats/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "pageview" }),
    }).catch(console.error);
  }, []);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    enabled: !!admin,
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
    enabled: !!admin,
  });

  const createArticleMutation = useMutation({
    mutationFn: async (articleData: any) => {
      await apiRequest("POST", "/api/articles", articleData);
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Статья создана успешно",
      });
      setArticleForm({
        title: "",
        excerpt: "",
        content: "",
        category: "Установка",
        imageUrl: "",
        published: false,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать статью",
        variant: "destructive",
      });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: string) => {
      await apiRequest("DELETE", `/api/articles/${articleId}`);
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Статья удалена успешно",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить статью",
        variant: "destructive",
      });
    },
  });

  const handleArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title.trim() || !articleForm.content.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }
    createArticleMutation.mutate(articleForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-primary">30HERTZ</div>
              <div className="text-sm text-muted-foreground">ADMIN</div>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            <div className="flex items-center px-4 py-3 text-card-foreground bg-primary/10 rounded-lg">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Панель управления
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-card-foreground"
              onClick={logout}
              data-testid="logout-button"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Выйти
            </Button>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-card-foreground">Панель управления</h1>
              <div className="text-sm text-muted-foreground">
                Добро пожаловать, {(admin as any)?.email}
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 overflow-auto">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card data-testid="stats-visitors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-card-foreground">
                        {(stats as any)?.visitors || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Посетители сегодня</div>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card data-testid="stats-articles">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-card-foreground">
                        {(articles as any[]).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Статей опубликовано</div>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card data-testid="stats-calculations">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-card-foreground">
                        {(stats as any)?.calculations || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Расчетов выполнено</div>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card data-testid="stats-pageviews">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-card-foreground">
                        {(stats as any)?.pageviews || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Просмотров сегодня</div>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create Article */}
              <Card>
                <CardHeader>
                  <CardTitle>Создать новую статью</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleArticleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Заголовок *</Label>
                      <Input
                        id="title"
                        value={articleForm.title}
                        onChange={(e) => setArticleForm({...articleForm, title: e.target.value})}
                        placeholder="Введите заголовок статьи"
                        data-testid="article-title-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="excerpt">Краткое описание</Label>
                      <Input
                        id="excerpt"
                        value={articleForm.excerpt}
                        onChange={(e) => setArticleForm({...articleForm, excerpt: e.target.value})}
                        placeholder="Краткое описание статьи"
                        data-testid="article-excerpt-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Категория</Label>
                      <Select value={articleForm.category} onValueChange={(value) => setArticleForm({...articleForm, category: value})}>
                        <SelectTrigger data-testid="article-category-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Установка">Установка</SelectItem>
                          <SelectItem value="Обзор">Обзор</SelectItem>
                          <SelectItem value="Настройка">Настройка</SelectItem>
                          <SelectItem value="Новости">Новости</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="imageUrl">URL изображения</Label>
                      <Input
                        id="imageUrl"
                        value={articleForm.imageUrl}
                        onChange={(e) => setArticleForm({...articleForm, imageUrl: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                        data-testid="article-image-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="content">Содержание *</Label>
                      <Textarea
                        id="content"
                        rows={8}
                        value={articleForm.content}
                        onChange={(e) => setArticleForm({...articleForm, content: e.target.value})}
                        placeholder="Введите текст статьи..."
                        className="resize-none"
                        data-testid="article-content-textarea"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={articleForm.published}
                        onChange={(e) => setArticleForm({...articleForm, published: e.target.checked})}
                        className="rounded border-border"
                        data-testid="article-published-checkbox"
                      />
                      <Label htmlFor="published">Опубликовать сразу</Label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full gradient-glow"
                      disabled={createArticleMutation.isPending}
                      data-testid="create-article-button"
                    >
                      {createArticleMutation.isPending ? "Создание..." : "Опубликовать статью"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Articles List */}
              <Card>
                <CardHeader>
                  <CardTitle>Управление статьями</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {(articles as any[]).length > 0 ? (
                      (articles as any[]).map((article: any) => (
                        <div key={article.id} className="flex items-center justify-between py-3 border-b border-border" data-testid={`article-item-${article.id}`}>
                          <div className="flex-1">
                            <div className="font-medium text-card-foreground">{article.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {article.category} • {new Date(article.createdAt).toLocaleDateString('ru-RU')}
                              {article.published ? (
                                <span className="ml-2 text-green-600">Опубликовано</span>
                              ) : (
                                <span className="ml-2 text-yellow-600">Черновик</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteArticleMutation.mutate(article.id)}
                            disabled={deleteArticleMutation.isPending}
                            data-testid={`delete-article-${article.id}`}
                          >
                            Удалить
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Статьи не найдены</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
