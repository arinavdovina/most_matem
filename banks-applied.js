/* Прикладная математика для «Моста знаний». Банк выбранной темы создаётся по запросу. */
(() => {
  'use strict';

  const banks = (window.BridgeBanks ||= {});

  function task(family, prompt, answer, unit) {
    return { family, prompt, answer, kind: 'text', ...(unit ? { unit } : {}) };
  }

  function counted(number, one, few, many) {
    const lastTwo = number % 100;
    const last = number % 10;
    const form = lastTwo >= 11 && lastTwo <= 14 ? many
      : last === 1 ? one : last >= 2 && last <= 4 ? few : many;
    return `${number} ${form}`;
  }

  function clock(minutes) {
    const hours = Math.floor(minutes / 60);
    return hours + ':' + String(minutes % 60).padStart(2, '0');
  }

  banks.geometry = function geometry() {
    const pool = [];
    for (let width = 2; width <= 15; width++) {
      for (let extra = 1; extra <= 12; extra++) {
        const length = width + extra;
        const sides = `${length} см и ${width} см`;
        const perimeter = 2 * (length + width);
        const area = length * width;
        pool.push(
          task('Периметр прямоугольника', `Стороны прямоугольника — ${sides}. Найди его периметр.`, perimeter, 'см'),
          task('Площадь прямоугольника', `Стороны прямоугольника — ${sides}. Чему равна его площадь?`, area, 'см²'),
          task('Сторона по периметру', `Периметр прямоугольника — ${perimeter} см, длина — ${length} см. Найди ширину.`, width, 'см'),
          task('Сторона по площади', `Площадь прямоугольника — ${area} м², ширина — ${width} м. Какова его длина?`, length, 'м'),
          task('Участок без ограды', `Сад имеет форму квадрата со стороной ${length} м. В ограде оставят проём шириной ${extra} м. Сколько метров ограды нужно?`, 4 * length - extra, 'м'),
          task('Составная площадь', `Лист бумаги размером ${length} × ${width} см разрезали поперёк. Отрезали полоску размером ${extra} × ${width} см. Какая площадь осталась?`, (length - extra) * width, 'см²')
        );
      }
    }
    for (let side = 2; side <= 50; side++) {
      pool.push(
        task('Площадь квадрата', `Сторона квадратной плитки — ${side} см. Найди площадь плитки.`, side * side, 'см²'),
        task('Сторона квадрата', `Периметр квадратной рамки — ${4 * side} см. Какова длина одной стороны?`, side, 'см')
      );
    }
    return pool;
  };

  banks.fractions = function fractions() {
    const pool = [];
    for (let denominator = 2; denominator <= 10; denominator++) {
      for (let share = 2; share <= 16; share++) {
        const whole = denominator * share;
        pool.push(
          task('Одна доля', `Ленту длиной ${whole} см разрезали на ${denominator} ${denominator <= 4 ? 'равные части' : 'равных частей'}. Какова длина одной части?`, share, 'см'),
          task('Целое по доле', `1/${denominator} пути составляет ${share} км. Какова длина всего пути?`, whole, 'км')
        );
        for (let numerator = 1; numerator < denominator; numerator++) {
          const text = `${numerator}/${denominator}`;
          const amount = numerator * share;
          pool.push(
            task('Дробь от числа', `В книге ${counted(whole, 'страница', 'страницы', 'страниц')}. Прочитано ${text} книги. Сколько страниц прочитано?`, amount, 'стр.'),
            task('Остаток целого', `Длина маршрута — ${whole} км. Уже пройдено ${text} маршрута. Сколько километров осталось?`, whole - amount, 'км')
          );
          if (numerator >= 2) {
            pool.push(task('Целое по дроби', `В ёмкости ${amount * 25} мл сока. Это ${text} её вместимости. Сколько миллилитров вмещает ёмкость?`, whole * 25, 'мл'));
          }
        }
      }
      for (let numerator = 1; numerator < denominator; numerator++) {
        for (let factor = 2; factor <= 6; factor++) {
          pool.push(task('Равные дроби', `Вставь числитель, чтобы дроби были равны: ${numerator}/${denominator} = □/${denominator * factor}.`, numerator * factor));
        }
      }
    }
    return pool;
  };

  banks.units = function units() {
    const pool = [];
    // A small-unit part always fits within one large unit.
    const scales = [
      { big: 'дм', small: 'см', many: 'сантиметров', factor: 10, steps: [1, 2, 4, 5, 7, 9] },
      { big: 'м', small: 'см', many: 'сантиметров', factor: 100, steps: [5, 10, 25, 40, 65, 90] },
      { big: 'см', small: 'мм', many: 'миллиметров', factor: 10, steps: [1, 3, 4, 5, 6, 8] },
      { big: 'км', small: 'м', many: 'метров', factor: 1000, steps: [50, 100, 250, 500, 750, 900] },
      { big: 'кг', small: 'г', many: 'граммов', factor: 1000, steps: [50, 100, 200, 250, 500, 750] },
      { big: 'л', small: 'мл', many: 'миллилитров', factor: 1000, steps: [50, 100, 200, 250, 500, 750] }
    ];
    for (const {big, small, many, factor, steps} of scales) {
      for (let large = 1; large <= 15; large++) {
        for (const part of steps) {
          const composed = `${large} ${big} ${part} ${small}`;
          const value = large * factor + part;
          pool.push(
            task('Составная величина', `Вырази ${composed} в меньших единицах. Сколько это ${many}?`, value, small),
            task('Выделение остатка', `Заполни пропуск: ${value} ${small} = ${large} ${big} □ ${small}.`, part, small),
            task('До целой единицы', `Сколько ${many} нужно прибавить к ${composed}, чтобы получить ${large + 1} ${big}?`, factor - part, small)
          );
        }
      }
    }
    for (let n = 2; n <= 12; n++) {
      for (const part of [10, 25, 50, 75]) {
        pool.push(
          task('Масса содержимого', `Корзина с ягодами весит ${n} кг. Пустая корзина весит ${part * 5} г. Сколько граммов весят ягоды?`, 1000 * n - part * 5, 'г'),
          task('Объём порций', `В канистре ${n} л воды. Сколько полных порций по ${part * 10} мл можно налить?`, Math.floor(n * 1000 / (part * 10)), 'порц.'),
          task('Сложение длин', `Одна доска имеет длину ${n} м ${part} см, другая — ${n - 1} м ${100 - part} см. Сколько метров составляет их общая длина?`, 2 * n, 'м')
        );
      }
    }
    return pool;
  };

  banks.time = function time() {
    const pool = [];
    for (let hour = 7; hour <= 19; hour++) {
      for (const minute of [0, 5, 15, 25, 35, 45, 55]) {
        const start = 60 * hour + minute;
        for (const duration of [15, 25, 40, 55, 75]) {
          pool.push(task('Длительность по часам', `Занятие началось в ${clock(start)} и закончилось в ${clock(start + duration)}. Сколько минут оно длилось?`, duration, 'мин'));
        }
        for (const pause of [5, 10, 15]) {
          const elapsed = 60 + (hour % 4) * 5;
          pool.push(task('Время без перерыва', `Репетиция шла с ${clock(start)} до ${clock(start + elapsed)}. Какова длительность самой репетиции в минутах, если перерыв занял ${pause} мин?`, elapsed - pause, 'мин'));
        }
        pool.push(task('До начала часа', `Сейчас ${clock(start)}. Через сколько минут часы покажут ${clock((hour + 1) * 60)}?`, 60 - minute, 'мин'));
      }
    }
    for (let hours = 1; hours <= 15; hours++) {
      for (const mins of [5, 10, 15, 20, 30, 35, 40, 45, 55]) {
        pool.push(
          task('Часы и минуты', `Поездка на поезде длилась ${hours} ч ${mins} мин. Сколько это минут?`, hours * 60 + mins, 'мин'),
          task('Остаток минут', `Поездка на поезде длится ${hours * 60 + mins} мин. Заполни пропуск: ${hours} ч □ мин.`, mins, 'мин')
        );
      }
    }
    for (let evening = 18; evening <= 23; evening++) {
      for (const departure of [0, 15, 30, 45]) {
        for (const arrival of [15, 30, 45, 75, 90]) {
          pool.push(task('Через полночь', `Автобус выехал в ${clock(evening * 60 + departure)} и прибыл в ${clock(arrival)} после полуночи следующего дня. Сколько минут он был в пути?`, 1440 - (evening * 60 + departure) + arrival, 'мин'));
        }
      }
    }
    return pool;
  };

  banks.money = function money() {
    const pool = [];
    for (let price = 8; price <= 36; price++) {
      for (let count = 2; count <= 9; count++) {
        const cost = price * count;
        const pay = [50, 100, 200, 500].find(bill => bill > cost);
        pool.push(
          task('Стоимость покупки', `Цена тетради — ${price} руб. Сколько рублей стоят ${counted(count, 'тетрадь', 'тетради', 'тетрадей')}?`, cost, 'руб.'),
          task('Цена за штуку', `За ${counted(count, 'одинаковый карандаш', 'одинаковых карандаша', 'одинаковых карандашей')} заплатили ${cost} руб. Сколько стоит один карандаш?`, price, 'руб.'),
          task('Сдача', `Купили ${counted(count, 'открытку', 'открытки', 'открыток')} по ${price} руб. Заплатили купюрой ${pay} руб. Какую сдачу нужно получить?`, pay - cost, 'руб.'),
          task('Сравнение цен', `Набор из ${count} ручек стоит ${cost - count} руб. Поштучно эти ручки стоят по ${price} руб. Сколько рублей удастся сэкономить, купив набор?`, count, 'руб.'),
          task('Покупка на бюджет', `Один блокнот стоит ${price} руб. Сколько блокнотов можно купить на ${cost + Math.floor(price / 2)} руб., если потратить как можно больше?`, count, 'шт.')
        );
      }
    }
    for (let rubles = 1; rubles <= 15; rubles++) {
      for (const kopecks of [5, 10, 15, 25, 50, 75, 90]) {
        pool.push(task('Рубли и копейки', `Переведи ${rubles} руб. ${kopecks} коп. в копейки.`, 100 * rubles + kopecks, 'коп.'));
      }
    }
    return pool;
  };

  banks.stories = function stories() {
    const pool = [];
    for (let groups = 2; groups <= 12; groups++) {
      for (let each = 3; each <= 18; each++) {
        // Small remainders keep the quantities concrete and fit within each group.
        const extra = 1 + (groups + each) % (groups - 1);
        const lost = 1 + (groups + each) % (each - 1);
        pool.push(
          task('Группы и остаток', `Для посадки приготовили ${counted(groups, 'ящик', 'ящика', 'ящиков')}, в каждом по ${counted(each, 'саженцу', 'саженца', 'саженцев')}. Ещё ${counted(extra, 'саженец несут', 'саженца несут', 'саженцев несут')} отдельно. Сколько всего саженцев?`, groups * each + extra, 'шт.'),
          task('Восстановление количества', `Из стопки раздали по ${counted(each, 'листу', 'листа', 'листов')} каждой команде. Всего было ${counted(groups, 'команда', 'команды', 'команд')}. В стопке ${lost === 1 ? 'остался' : 'осталось'} ${counted(lost, 'лист', 'листа', 'листов')}. Сколько листов было сначала?`, groups * each + lost, 'шт.'),
          task('Распределение поровну', `В библиотеку привезли ${counted(groups * each + extra, 'книгу', 'книги', 'книг')}. В читальном зале оставили ${counted(extra, 'книгу', 'книги', 'книг')}, остальные распределили поровну. Книги получили ${counted(groups, 'класс', 'класса', 'классов')}. Сколько книг получил каждый?`, each, 'шт.'),
          task('Сравнение в несколько раз', `Оля собрала ${counted(each, 'шишку', 'шишки', 'шишек')}. У Иры в ${counted(groups, 'раз', 'раза', 'раз')} больше. На сколько шишек больше у Иры, чем у Оли?`, each * (groups - 1), 'шт.'),
          task('Число рейсов', `Катер берёт за рейс не более ${groups} пассажиров. Сколько рейсов понадобится, чтобы перевезти ${counted(groups * each + extra, 'человека', 'человек', 'человек')}?`, each + 1, 'рейс.'),
          task('Совместная работа', `За один день первая мастерская шьёт ${counted(each, 'сумку', 'сумки', 'сумок')}, вторая — ${counted(each - lost, 'сумку', 'сумки', 'сумок')}. Сколько сумок они вместе сошьют за ${counted(groups, 'день', 'дня', 'дней')} при таком темпе?`, (2 * each - lost) * groups, 'шт.')
        );
      }
    }
    return pool;
  };
})();
