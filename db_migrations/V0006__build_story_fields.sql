-- Polya dlya slayd-prezentacii sborki

ALTER TABLE builds ADD COLUMN IF NOT EXISTS key_tasks VARCHAR(400);
ALTER TABLE components ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Foto komplektuyushchih po tipu
UPDATE components SET image_url = 'https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/files/1eba4228-8be2-4988-ad40-2cef870ea7e8.jpg' WHERE type = 'CPU';
UPDATE components SET image_url = 'https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/files/914c879c-2dc9-4594-8af9-8aa6cbc7f66e.jpg' WHERE type = 'GPU';
UPDATE components SET image_url = 'https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/files/9ed96dbc-e405-48df-ac74-95f83dd40d08.jpg' WHERE type = 'RAM';
UPDATE components SET image_url = 'https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/files/cc085202-c57e-4957-94d7-78854a7320e5.jpg' WHERE type = 'SSD';
UPDATE components SET image_url = 'https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/files/9f528d58-342c-426e-802b-d751ab16ef1f.jpg' WHERE type = 'MOTHERBOARD';
UPDATE components SET image_url = 'https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/files/ea2be925-ea7a-4afe-ac44-a728467c3ea2.jpg' WHERE type = 'PSU';
UPDATE components SET image_url = 'https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/files/456079c4-516b-45b6-a00c-447709f628f1.jpg' WHERE type = 'CASE';

-- Klyuchevye zadachi dlya kazhdoy sborki
UPDATE builds SET key_tasks = 'Kibersport i onlayn-shutery;Igry v Full HD na ultra;Strimy i uchyoba' WHERE slug = 'razpc-storm';
UPDATE builds SET key_tasks = 'Igry v 1440p na maksimume;Montazh video;Mnogozadachnost' WHERE slug = 'razpc-titan';
UPDATE builds SET key_tasks = 'Igry v 4K;Tvorchestvo i 3D;Tyazhelye rabochie zadachi' WHERE slug = 'razpc-ultra';
UPDATE builds SET key_tasks = '4K bez kompromissov;Professionalniy rendering;AI i vychisleniya' WHERE slug = 'razpc-apex';