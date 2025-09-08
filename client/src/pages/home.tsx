import Navigation from "@/components/navigation";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Footer from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  const { data: latestArticles = [] } = useQuery({
    queryKey: ["/api/articles/latest/3"],
  });

  const calculatorTools = [
    {
      title: "Расчет короба",
      description: "Точный расчет объема и размеров корпуса для сабвуфера",
      icon: "📦",
      link: "/calculators#box",
    },
    {
      title: "Сечение кабеля",
      description: "Расчет сечения силового кабеля по мощности и длине",
      icon: "⚡",
      link: "/calculators#cable",
    },
    {
      title: "Коммутация динамиков",
      description: "Схемы подключения динамиков и расчет импеданса",
      icon: "🔊",
      link: "/calculators#wiring",
    },
    {
      title: "Фазоинвертор",
      description: "Расчет размеров порта для фазоинверторного короба",
      icon: "🔧",
      link: "/calculators#port",
    },
    {
      title: "Предохранители",
      description: "Расчет номинала предохранителей для силовых цепей",
      icon: "🔒",
      link: "/calculators#fuse",
    },
    {
      title: "Генератор синуса",
      description: "Генерация тестовых сигналов для настройки системы",
      icon: "🎵",
      link: "/calculators#sine",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      
      {/* Calculators Preview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Расчеты и Калькуляторы
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Профессиональные инструменты для точного расчета параметров автозвуковой системы
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculatorTools.map((tool, index) => (
              <Link key={index} href={tool.link}>
                <Card className="cursor-pointer hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group" data-testid={`calculator-card-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="text-3xl mr-4">{tool.icon}</div>
                      <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{tool.description}</p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Перейти к расчету
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Новое на сайте
              </h2>
              <p className="text-xl text-muted-foreground">
                Последние статьи и обзоры в мире автозвука
              </p>
            </div>
            <Link href="/articles">
              <button className="hidden md:flex items-center text-primary hover:text-primary/80 transition-colors font-medium" data-testid="view-all-articles">
                Все статьи
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(latestArticles as any[]).length > 0 ? (
              (latestArticles as any[]).map((article: any, index: number) => (
                <article key={article.id} className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group" data-testid={`article-card-${index}`}>
                  {article.imageUrl && (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="p-6">
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
                    <p className="text-muted-foreground text-sm">
                      {article.excerpt}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Пока нет опубликованных статей
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
