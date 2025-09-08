import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function Articles() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
    queryFn: async () => {
      const response = await fetch("/api/articles?published=true");
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  useEffect(() => {
    // Track pageview
    fetch("/api/stats/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "pageview" }),
    }).catch(console.error);
  }, []);

  const categories = ["all", "Установка", "Обзор", "Настройка", "Новости"];

  const filteredArticles = selectedCategory === "all" 
    ? articles 
    : articles.filter((article: any) => article.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Статьи и Обзоры
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Экспертные материалы, обзоры оборудования и практические советы по автозвуку
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              data-testid={`category-filter-${category}`}
            >
              {category === "all" ? "Все категории" : category}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article: any, index: number) => (
              <Card key={article.id} className="overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group" data-testid={`article-${index}`}>
                {article.imageUrl && (
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(article.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {article.excerpt}
                  </p>
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: article.content.substring(0, 200) + (article.content.length > 200 ? "..." : "")
                    }}
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {selectedCategory === "all" ? "Пока нет статей" : `Нет статей в категории "${selectedCategory}"`}
              </h3>
              <p className="text-muted-foreground">
                Статьи появятся здесь после публикации администратором
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
