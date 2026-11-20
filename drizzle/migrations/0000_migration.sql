create type public.app_role as enum ('admin','student');
create type public.content_status as enum ('draft','review','published');
create type public.content_origin as enum ('official','supplementary','demo');

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.streams (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete cascade,
  name text not null,
  sort_order int not null default 0
);
create table public.units (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete cascade,
  stream_id uuid references public.streams(id) on delete set null,
  title text not null,
  description text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  title text not null,
  objectives text[] not null default '{}',
  summary text,
  content text,
  key_terms jsonb not null default '[]',
  check_questions text[] not null default '{}',
  image_url text,
  video_url text,
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  origin public.content_origin not null default 'demo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  type text not null check (type in ('mcq','truefalse','fill','order','match')),
  prompt text not null,
  options jsonb not null default '[]',
  answer jsonb not null,
  explanation text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid references public.grades(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  title text not null,
  kind text not null default 'link',
  url text not null,
  description text,
  origin public.content_origin not null default 'demo',
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  grade_id uuid references public.grades(id) on delete set null,
  stream text,
  created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
create table public.lesson_progress (
  user_id uuid not null,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  saved boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  unit_id uuid not null references public.units(id) on delete cascade,
  mode text not null default 'exam',
  score int not null,
  total int not null,
  wrong_lesson_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

grant select on public.grades, public.streams, public.units, public.lessons, public.questions, public.resources to anon, authenticated;
grant insert, update, delete on public.grades, public.streams, public.units, public.lessons, public.questions, public.resources to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select, insert, update, delete on public.lesson_progress, public.quiz_attempts to authenticated;
grant all on all tables in schema public to service_role;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

alter table public.grades enable row level security;
alter table public.streams enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.resources enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "public read grades" on public.grades for select using (true);
create policy "public read streams" on public.streams for select using (true);
create policy "public read units" on public.units for select using (is_published or public.has_role(auth.uid(),'admin'));
create policy "public read lessons" on public.lessons for select using (status = 'published' or public.has_role(auth.uid(),'admin'));
create policy "public read questions" on public.questions for select using (is_published or public.has_role(auth.uid(),'admin'));
create policy "public read resources" on public.resources for select using (is_published or public.has_role(auth.uid(),'admin'));

create policy "admin write grades" on public.grades for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write streams" on public.streams for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write units" on public.units for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write lessons" on public.lessons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write questions" on public.questions for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write resources" on public.resources for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "own progress" on public.lesson_progress for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own attempts" on public.quiz_attempts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Seed (demo content, clearly labeled)
insert into public.grades (id, slug, name, description, sort_order, is_active) values
 ('11111111-0000-0000-0000-000000000001','1as','السنة الأولى ثانوي','جذع مشترك علوم وتكنولوجيا / آداب',1,true),
 ('11111111-0000-0000-0000-000000000002','2as','السنة الثانية ثانوي','سيُفعَّل عند إضافة المحتوى',2,false),
 ('11111111-0000-0000-0000-000000000003','3as','السنة الثالثة ثانوي','سيُفعَّل عند إضافة المحتوى',3,false);
insert into public.streams (grade_id, name, sort_order) values
 ('11111111-0000-0000-0000-000000000001','جذع مشترك علوم وتكنولوجيا',1),
 ('11111111-0000-0000-0000-000000000001','جذع مشترك آداب',2);

insert into public.units (id, grade_id, title, description, sort_order) values
 ('22222222-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','الحاسوب ومكوناته','التعرف على الحاسوب ومكوناته المادية والبرمجية',1),
 ('22222222-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000001','نظام التشغيل','إدارة الملفات والمجلدات والتعامل مع نظام التشغيل',2),
 ('22222222-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000001','الشبكات والإنترنت','مفاهيم أساسية حول الشبكات وخدمات الإنترنت',3);

insert into public.lessons (id, unit_id, title, objectives, summary, content, key_terms, check_questions, sort_order, status, origin) values
('33333333-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','مفهوم الإعلام الآلي والحاسوب',
 array['تعريف الإعلام الآلي','تعريف الحاسوب','التمييز بين المعطيات والمعلومات'],
 'الإعلام الآلي هو علم المعالجة الآلية للمعلومات بواسطة الحاسوب. الحاسوب آلة إلكترونية تستقبل المعطيات وتعالجها وتخزنها وتُخرج النتائج.',
 E'## تعريف الإعلام الآلي\nالإعلام الآلي (Informatique) كلمة مركبة من "معلومات" و"آلي"، وتعني المعالجة الآلية للمعلومات.\n\n## تعريف الحاسوب\nالحاسوب جهاز إلكتروني يقوم بأربع وظائف أساسية:\n- **الإدخال**: استقبال المعطيات.\n- **المعالجة**: إجراء العمليات الحسابية والمنطقية.\n- **التخزين**: حفظ المعطيات والنتائج.\n- **الإخراج**: عرض النتائج.\n\n## المعطيات والمعلومات\nالمعطيات هي مادة خام (أرقام، حروف...) والمعلومة هي ناتج معالجة المعطيات وتحمل معنى.\n\n## مثال تطبيقي\nعلامات التلميذ (12، 15، 9) معطيات، أما المعدل 12 فهو معلومة.',
 '[{"term":"الإعلام الآلي","def":"المعالجة الآلية للمعلومات"},{"term":"المعطيات","def":"مادة خام قبل المعالجة"},{"term":"المعلومة","def":"ناتج معالجة المعطيات"}]',
 array['ما هي الوظائف الأربع للحاسوب؟','أعط مثالاً عن معطيات ومعلومة.'],1,'published','demo'),
('33333333-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000001','المكونات المادية للحاسوب',
 array['التعرف على الوحدة المركزية','تصنيف وحدات الإدخال والإخراج','التعرف على وسائط التخزين'],
 'يتكون الحاسوب من وحدة مركزية (المعالج، الذاكرة، اللوحة الأم) ووحدات محيطية للإدخال والإخراج والتخزين.',
 E'## الوحدة المركزية\nتضم **اللوحة الأم** التي تُثبَّت عليها المكونات، و**المعالج (CPU)** الذي ينفذ التعليمات، و**الذاكرة الحية (RAM)** المؤقتة.\n\n## وحدات الإدخال\nلوحة المفاتيح، الفأرة، الماسح الضوئي، الميكروفون.\n\n## وحدات الإخراج\nالشاشة، الطابعة، مكبرات الصوت.\n\n## وسائط التخزين\nالقرص الصلب (HDD)، أقراص SSD، الذاكرة الوميضية (USB).\n\n## مزود الطاقة\nيحوّل التيار الكهربائي ويغذي جميع المكونات.\n\n> جرّب **محاكي تجميع الحاسوب** لتركيب هذه المكونات بنفسك.',
 '[{"term":"المعالج CPU","def":"العقل المدبر الذي ينفذ التعليمات"},{"term":"RAM","def":"ذاكرة حية مؤقتة تُمسح عند إطفاء الجهاز"},{"term":"اللوحة الأم","def":"اللوحة التي تربط جميع المكونات"}]',
 array['ما الفرق بين RAM والقرص الصلب؟','صنّف: الطابعة، الفأرة، الماسح الضوئي.'],2,'published','demo'),
('33333333-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000001','البرمجيات وأنواعها',
 array['تعريف البرمجيات','التمييز بين برمجيات النظام والبرمجيات التطبيقية'],
 'البرمجيات هي الجزء غير الملموس من الحاسوب، وتنقسم إلى برمجيات نظام وبرمجيات تطبيقية.',
 E'## تعريف\nالبرمجية مجموعة تعليمات مكتوبة بلغة برمجة تؤدي مهمة محددة.\n\n## أنواع البرمجيات\n- **برمجيات النظام**: مثل نظام التشغيل Windows وLinux.\n- **البرمجيات التطبيقية**: مثل معالج النصوص والمجدولات والمتصفح.',
 '[{"term":"برمجية","def":"مجموعة تعليمات تؤدي مهمة"},{"term":"نظام التشغيل","def":"برمجية تدير موارد الحاسوب"}]',
 array['اذكر مثالين عن برمجيات تطبيقية.'],3,'published','demo'),
('33333333-0000-0000-0000-000000000004','22222222-0000-0000-0000-000000000002','الملفات والمجلدات',
 array['تعريف الملف والمجلد','فهم امتداد الملف','إنشاء شجرة مجلدات'],
 'الملف وحدة لتخزين المعلومات له اسم وامتداد، والمجلد حاوية تنظم الملفات.',
 E'## الملف\nيتكون اسم الملف من جزأين: **الاسم** و**الامتداد** مثل `درس.docx`.\n\n## المجلد\nحاوية لتنظيم الملفات والمجلدات الفرعية، وتشكل المجلدات بنية شجرية.\n\n## أمثلة على الامتدادات\n- `.txt` نص\n- `.jpg` صورة\n- `.pdf` مستند',
 '[{"term":"امتداد","def":"الجزء بعد النقطة ويدل على نوع الملف"},{"term":"مسار","def":"موقع الملف داخل شجرة المجلدات"}]',
 array['ما نوع الملف photo.jpg؟'],1,'published','demo'),
('33333333-0000-0000-0000-000000000005','22222222-0000-0000-0000-000000000003','مفهوم الشبكة وأنواعها',
 array['تعريف الشبكة','التمييز بين LAN وMAN وWAN'],
 'الشبكة مجموعة أجهزة مترابطة لتبادل المعلومات وتقاسم الموارد، وتصنف حسب المساحة الجغرافية.',
 E'## تعريف\nالشبكة المعلوماتية مجموعة حواسيب وأجهزة مرتبطة ببعضها لتبادل المعطيات.\n\n## الأنواع حسب المساحة\n- **LAN** شبكة محلية (مخبر المدرسة).\n- **MAN** شبكة مدينة.\n- **WAN** شبكة واسعة، والإنترنت أكبر مثال.',
 '[{"term":"LAN","def":"شبكة محلية"},{"term":"WAN","def":"شبكة واسعة"}]',
 array['ما نوع شبكة مخبر الإعلام الآلي؟'],1,'published','demo');

insert into public.questions (unit_id, lesson_id, type, prompt, options, answer, explanation, sort_order) values
('22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','mcq','ما هي الوظيفة التي تُجرى فيها العمليات الحسابية والمنطقية؟','["الإدخال","المعالجة","الإخراج","التخزين"]','1','المعالجة هي إجراء العمليات الحسابية والمنطقية على المعطيات.',1),
('22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','truefalse','المعدل الفصلي للتلميذ يُعتبر معلومة.','["صح","خطأ"]','0','المعدل ناتج عن معالجة العلامات فهو معلومة.',2),
('22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000002','mcq','أي من التالي وحدة إدخال؟','["الشاشة","الطابعة","الماسح الضوئي","مكبر الصوت"]','2','الماسح الضوئي يُدخل الصور إلى الحاسوب.',3),
('22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000002','truefalse','محتوى الذاكرة الحية RAM يبقى بعد إطفاء الحاسوب.','["صح","خطأ"]','1','RAM ذاكرة مؤقتة يُمسح محتواها عند انقطاع التيار.',4),
('22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000002','fill','العقل المدبر للحاسوب هو ............','[]','["المعالج","cpu","المعالج cpu"]','المعالج (CPU) ينفذ التعليمات.',5),
('22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000002','match','طابق كل مكوّن بصنفه.','{"left":["لوحة المفاتيح","الطابعة","القرص الصلب"],"right":["إدخال","إخراج","تخزين"]}','[0,1,2]','لوحة المفاتيح للإدخال، الطابعة للإخراج، القرص الصلب للتخزين.',6),
('22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','order','رتّب مراحل عمل الحاسوب.','["المعالجة","الإدخال","الإخراج"]','[1,0,2]','الترتيب: إدخال ← معالجة ← إخراج.',7),
('22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000003','mcq','Windows هو مثال عن:','["برمجية تطبيقية","نظام تشغيل","وحدة إدخال","لغة برمجة"]','1','Windows نظام تشغيل يدير موارد الحاسوب.',8),
('22222222-0000-0000-0000-000000000002','33333333-0000-0000-0000-000000000004','mcq','ما نوع الملف ذي الامتداد ‎.jpg؟','["نص","صورة","صوت","برنامج"]','1','jpg امتداد لملفات الصور.',1),
('22222222-0000-0000-0000-000000000002','33333333-0000-0000-0000-000000000004','truefalse','يمكن أن يحتوي المجلد على مجلدات فرعية.','["صح","خطأ"]','0','المجلدات تشكل بنية شجرية.',2),
('22222222-0000-0000-0000-000000000003','33333333-0000-0000-0000-000000000005','mcq','شبكة مخبر الإعلام الآلي في الثانوية هي شبكة:','["LAN","MAN","WAN","لا شيء"]','0','شبكة محدودة في مبنى واحد فهي محلية LAN.',1),
('22222222-0000-0000-0000-000000000003','33333333-0000-0000-0000-000000000005','fill','أكبر مثال على الشبكة الواسعة هو ............','[]','["الإنترنت","الانترنت","internet"]','الإنترنت شبكة عالمية واسعة.',2);

insert into public.resources (grade_id, unit_id, title, kind, url, description) values
('11111111-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','ملخص: مكونات الحاسوب','summary','/lessons/33333333-0000-0000-0000-000000000002','ملخص الدرس داخل المنصة'),
('11111111-0000-0000-0000-000000000001',null,'موقع وزارة التربية الوطنية','link','https://www.education.gov.dz','الموقع الرسمي للوزارة'),
('11111111-0000-0000-0000-000000000001',null,'الديوان الوطني للتعليم والتكوين عن بعد','link','https://www.onefd.edu.dz','مصادر تعليمية رسمية');