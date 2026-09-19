-- Demo catalog moved over from the static JSON files, unchanged.
-- Real crag data is imported separately; this seed keeps the app usable
-- on a fresh database.

insert into public.regions (id, name, province, rock_type, grade_range, sector_count, route_count) values
  ('kamianets-podilskyi', 'Кам''янець-Подільський', 'Хмельницька', 'вапняк', '5a-8b', 7, 148),
  ('denesh', 'Денеші', 'Житомирська', 'граніт', '4c-8a', 5, 96),
  ('aktove', 'Актівський каньйон', 'Миколаївська', 'граніт', '5a-8b+', 4, 52);

insert into public.sectors (id, id_region, name, description, grade_range, approach_minutes, route_count) values
  ('bastion', 'kamianets-podilskyi', 'Бастіон', 'Вертикаль і навислі стіни, мізери. Сонце після 15:00.', '6a-8a', 10, 24),
  ('dzerkalo', 'kamianets-podilskyi', 'Дзеркало', 'Пологі плити, багато легких ліній для розкатки.', '5a-7a', 4, 31),
  ('karnyz', 'kamianets-podilskyi', 'Карниз', 'Сильне навислення, тінь. Сухо після дощу.', '6c-8b', 18, 19),
  ('stina-nad-vodoyu', 'kamianets-podilskyi', 'Стіна над водою', 'Вихід просто над річкою, ранкове сонце.', '5b-7b', 12, 22),
  ('denesh-main', 'denesh', 'Головний сектор', 'Гранітні плити, стабільна тінь у другій половині дня.', '4c-7c', 15, 40),
  ('aktove-canyon', 'aktove', 'Каньйон', 'Довгі маршрути над водою, потрібна страховка на спуску.', '5a-8b+', 20, 30);

insert into public.routes (id, id_sector, name, grade, type, length, bolts_count, description) values
  ('mizerna-lohika', 'bastion', 'Мізерна логіка', '7a', 'sport', 20, 8, 'Технічний вихід по мізерах у нижній частині.'),
  ('sokil', 'bastion', 'Сокіл', '7a+', 'sport', 22, 9, 'Старт по мізерах під карнизом, ключ — вихід із карниза на третій відтяжці.'),
  ('liva-shchylyna', 'bastion', 'Ліва щілина', '6b+', 'trad', 18, 0, 'Класична щілина, потрібне власне спорядження.'),
  ('dovhyi-shlyakh', 'bastion', 'Довгий шлях', '6c+', 'sport', 28, 11, 'Найдовший маршрут сектора, витривалість на другій половині.'),
  ('promin', 'bastion', 'Промінь', '8a', 'sport', 24, 10, 'Пробитий нещодавно, потребує підтвердження категорії.'),
  ('dzerkalo-1', 'dzerkalo', 'Плита №1', '5a', 'sport', 16, 6, 'Легка розкатувальна лінія на пологій плиті.'),
  ('karnyz-1', 'karnyz', 'Навислий карниз', '7c', 'sport', 20, 9, 'Силовий вихід через навислу секцію.'),
  ('stina-1', 'stina-nad-vodoyu', 'Ранкова стіна', '6a', 'sport', 18, 7, 'Вертикальна стіна прямо над водою.'),
  ('denesh-1', 'denesh-main', 'Гранітна плита', '6a', 'sport', 25, 8, 'Технічна плита на тертя.'),
  ('aktove-1', 'aktove-canyon', 'Над водоспадом', '6b', 'sport', 30, 10, 'Довгий маршрут з красивим виглядом на каньйон.');
