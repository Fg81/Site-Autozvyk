import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative bg-background hero-pattern py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">Профессиональный</span><br />
              <span className="text-primary">Автозвук</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Экспертные знания, точные расчеты и профессиональные инструменты для создания 
              идеальной аудиосистемы в вашем автомобиле.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/calculators">
                <Button className="gradient-glow px-8 py-4 text-primary-foreground font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" data-testid="calculators-cta-button">
                  Калькуляторы
                </Button>
              </Link>
              <Link href="/articles">
                <Button variant="outline" className="px-8 py-4 font-semibold" data-testid="articles-cta-button">
                  Читать статьи
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Professional car audio system" 
              className="rounded-2xl shadow-2xl w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
