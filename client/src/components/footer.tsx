import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-2xl font-bold text-primary">30</div>
              <div className="w-6 h-0.5 bg-primary audio-wave"></div>
              <div className="text-2xl font-bold text-card-foreground">HERTZ</div>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Профессиональный ресурс для автозвука. Точные расчеты, экспертные статьи и инструменты для создания идеальной аудиосистемы.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                data-testid="social-link-twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                data-testid="social-link-telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Разделы</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/calculators">
                  <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-calculators">
                    Калькуляторы
                  </button>
                </Link>
              </li>
              <li>
                <Link href="/articles">
                  <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-articles">
                    Статьи
                  </button>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Инструменты</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/calculators#box">
                  <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-box-calc">
                    Расчет короба
                  </button>
                </Link>
              </li>
              <li>
                <Link href="/calculators#cable">
                  <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-cable-calc">
                    Сечение кабеля
                  </button>
                </Link>
              </li>
              <li>
                <Link href="/calculators#sine">
                  <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-sine-gen">
                    Генератор синуса
                  </button>
                </Link>
              </li>
              <li>
                <Link href="/calculators#port">
                  <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-port-calc">
                    Фазоинвертор
                  </button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2025 30HERTZ. Все права защищены.
            <Link href="/admin">
              <button className="text-primary hover:text-primary/80 ml-2" data-testid="admin-access-link">
                •
              </button>
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
