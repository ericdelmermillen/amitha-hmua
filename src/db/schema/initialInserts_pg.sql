INSERT INTO
  bio (id, name, img_url, text) OVERRIDING SYSTEM VALUE
VALUES
  (
    1,
    'Amitha Millen-Suwanta',
    'e0d7e126-eaab-4e1a-957a-fe9563ed71ec.jpeg',
    E 'Meet Amitha, a dynamic makeup artist and fashion stylist who thrives on celebrating the unique beauty of each person. With a deep understanding that beauty knows no bounds, she rejects the notion of a one-size-fits-all approach to makeup. Instead, she crafts bespoke experiences for her clients, considering their individuality, comfort levels, and personal style.\n\nLocated in the heart of Toronto, Ontario, Amitha''s professional journey has been a whirlwind of diverse experiences within the beauty industry. Though she revels in all aspects of her craft, her passion ignites most brightly within the realms of Fashion and Bridal makeup.\n\nFrom esteemed corporations to celebrated singers, actors, and brands across Canada, the USA, and the UK, Amitha and her team ensure that each client embarks on a unique and unforgettable beauty journey.'
  );

SELECT
  setval(
    pg_get_serial_sequence('bio', 'id'),
    (
      SELECT
        MAX(id)
      FROM
        bio
    )
  );

INSERT INTO
  model (id, name) OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Test Model'),
  (2, 'Atom K'),
  (3, 'Anna Zemly'),
  (4, 'Note Amit'),
  (5, 'Ash Kalyn'),
  (6, 'Amire'),
  (7, 'Catherina A'),
  (8, 'John Millen'),
  (9, 'Veronica Ye'),
  (10, 'Agatha'),
  (11, 'Makhy '),
  (12, 'Trevor Carter '),
  (13, 'Natasha Rabura'),
  (14, 'Grace '),
  (15, 'Pattricia '),
  (16, 'Adwoa'),
  (17, 'Daniella Traa'),
  (18, 'Ally'),
  (19, 'Anna'),
  (20, 'Jayden  Aj'),
  (21, 'Caylen Walker'),
  (22, 'Abby'),
  (23, 'Don'),
  (25, 'Gahaya'),
  (26, 'Celia'),
  (27, 'Mimi'),
  (28, 'Hannah Zervos'),
  (29, 'Gaiyan'),
  (30, 'Luke'),
  (31, 'Oleg'),
  (32, 'Varintorn Yaroojjanont'),
  (33, 'Natalia Polakowski'),
  (34, 'Jessica Gwen'),
  (35, 'Layla Harris'),
  (36, 'Maria'),
  (37, 'Gloria'),
  (38, 'Ayesha'),
  (39, 'Alex'),
  (40, 'Issabella'),
  (41, 'Molly'),
  (42, 'College of Makeup Art and Design'),
  (45, 'Ash Kalyn (2)'),
  (46, 'Abigail'),
  (47, 'Vogue Italian Online'),
  (49, 'Nasty Magazine'),
  (50, 'Catherine'),
  (53, 'Playapex'),
  (54, 'Marcozo'),
  (55, 'Huemanity Hair Color'),
  (56, 'Paradox Unity'),
  (57, 'Karina'),
  (58, 'Natalia'),
  (59, 'Hannas'),
  (60, 'Kristien'),
  (62, 'Rembo'),
  (63, 'Shazeeda Gafoor'),
  (64, 'Baie'),
  (65, 'Barbara'),
  (66, 'Emma Almeida'),
  (67, 'Eric, Wesley, Oliver, Andrew, Ugo'),
  (68, 'Bluivory'),
  (69, 'Daria M'),
  (70, 'Sharon'),
  (71, 'Elite Models'),
  (72, 'Rae'),
  (73, 'Tressy'),
  (75, 'Amitha Millen-Suwanta'),
  (76, 'Anika Julia'),
  (82, 'Elis');

SELECT
  setval(
    pg_get_serial_sequence('model', 'id'),
    (
      SELECT
        MAX(id)
      FROM
        model
    )
  );

INSERT INTO
  photographer (id, name) OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Test Photo'),
  (4, 'Umair Shaikh'),
  (5, 'AGIVA Canada'),
  (6, 'Ariel Lii '),
  (7, 'Ashley '),
  (8, 'GJ'),
  (9, 'Jainik'),
  (10, 'Victoria'),
  (11, 'Mark Gallardo'),
  (12, 'Peter '),
  (13, 'Emily '),
  (14, 'Ryan '),
  (15, 'Backdropsgallery'),
  (16, 'The Purest Form'),
  (17, 'Sean Leber'),
  (18, 'Theater'),
  (19, 'Vouge Italian Online'),
  (20, 'Eli'),
  (21, 'Hiep'),
  (22, 'Boyu Jian'),
  (23, 'Olega'),
  (24, 'Matthew Bennette'),
  (25, 'Jian Von Esmane'),
  (26, 'Jim CMU'),
  (27, 'Alfie'),
  (29, 'Dimitri Traganis'),
  (37, 'Samuel Engelking');

SELECT
  setval(
    pg_get_serial_sequence('photographer', 'id'),
    (
      SELECT
        MAX(id)
      FROM
        photographer
    )
  );

INSERT INTO
  tag (id, name) OVERRIDING SYSTEM VALUE
VALUES
  (7, 'Commercial'),
  (8, 'Creative'),
  (9, 'Styling'),
  (10, 'Beauty'),
  (11, 'Wigs'),
  (12, 'Grooming'),
  (16, 'Theater'),
  (17, 'Celebrities'),
  (18, 'Bridal'),
  (35, 'Fashion');

SELECT
  setval(
    pg_get_serial_sequence('tag', 'id'),
    (
      SELECT
        MAX(id)
      FROM
        tag
    )
  );

INSERT INTO
  shoot (id, date, display_order) OVERRIDING SYSTEM VALUE
VALUES
  (9, '2024-07-10', 103),
  (14, '2024-07-10', 95),
  (15, '2024-07-10', 82),
  (20, '2024-07-10', 87),
  (44, '2024-07-10', 92),
  (48, '2024-07-10', 76),
  (54, '2024-07-10', 118),
  (62, '2024-07-10', 100),
  (73, '2024-07-11', 125),
  (79, '2024-07-17', 74),
  (81, '2024-07-18', 71),
  (134, '2026-09-03', 2),
  (135, '2026-09-16', 1);

SELECT
  setval(
    pg_get_serial_sequence('shoot', 'id'),
    (
      SELECT
        MAX(id)
      FROM
        shoot
    )
  );

INSERT INTO
  photo (id, shoot_id, img_url, display_order) OVERRIDING SYSTEM VALUE
VALUES
  (
    1271,
    48,
    '1b48ad07-09cf-48f4-8f42-629a023322b6.jpeg',
    1
  ),
  (
    1293,
    20,
    '0dabce78-d835-4405-9307-8fd0275b8ef9.jpeg',
    1
  ),
  (
    1294,
    20,
    '30b02936-a9ff-406a-850e-912d7df6d1c4.jpeg',
    2
  ),
  (
    1295,
    20,
    '1d26fa40-4cce-4636-af47-5859b6131863.jpeg',
    3
  ),
  (
    1296,
    20,
    '174d2a65-1f67-4312-911a-dbf74b37d430.jpeg',
    4
  ),
  (
    1297,
    20,
    '3503b1d5-fb9a-4445-9735-ee0de4e67994.jpeg',
    5
  ),
  (
    1303,
    15,
    '1d8375fd-5549-4251-97e1-70248de46469.jpeg',
    1
  ),
  (
    1304,
    15,
    'a99091dd-a60e-4ea6-b095-1b2476d28957.jpeg',
    2
  ),
  (
    1305,
    15,
    '20b742c3-d4b1-435f-81c5-8ec333972809.jpeg',
    3
  ),
  (
    1306,
    15,
    'ec2f171a-1174-4a28-bda1-15e14904f32f.jpeg',
    4
  ),
  (
    1324,
    14,
    '9cb26eee-920e-4c05-a705-5e8ebf510f6b.jpeg',
    1
  ),
  (
    1325,
    14,
    '627227e4-5272-41b7-a527-9d5510ed996a.jpeg',
    2
  ),
  (
    1326,
    14,
    '9feaeb31-c299-4a3a-b23e-898c94e1b98a.jpeg',
    3
  ),
  (
    1327,
    44,
    '0f8e05c1-4f47-467f-80d5-51193d48fb65.jpeg',
    1
  ),
  (
    1328,
    44,
    'dca5adc0-9312-4bf2-80c6-0914741c1d20.jpeg',
    2
  ),
  (
    1340,
    62,
    '92808481-a3ae-4fd9-bad2-23b331bd07a3.jpeg',
    1
  ),
  (
    1341,
    62,
    'efdbd0e9-068b-4724-83d8-e1faea464a5a.jpeg',
    2
  ),
  (
    1342,
    62,
    'e9cac134-1541-42db-8edb-fbaac6167b25.jpeg',
    3
  ),
  (
    1354,
    9,
    'bbe311da-ed7f-46e6-bf6b-6d8a04549365.jpeg',
    1
  ),
  (
    1355,
    9,
    '2e0e6936-84c7-455c-ad37-2c78a34cc501.jpeg',
    2
  ),
  (
    1356,
    9,
    '8b6a8ec5-f907-4750-993b-844bfc600326.jpeg',
    3
  ),
  (
    1357,
    9,
    '28a332ec-c925-46ba-9072-b027534969e0.jpeg',
    4
  ),
  (
    1358,
    9,
    '865b2276-e551-4d37-99e5-54346d6398cd.jpeg',
    5
  ),
  (
    1427,
    54,
    'ce1bbd62-0d21-4c7a-9dd2-c0c586d5ea71.jpeg',
    1
  ),
  (
    1428,
    54,
    '82e40892-f5df-4f23-9b2f-4b2fa1621853.jpeg',
    2
  ),
  (
    1429,
    54,
    '1d160f9a-1faa-4338-885f-322d6db6cf09.jpeg',
    3
  ),
  (
    1430,
    54,
    'a6134b59-1166-4d13-9735-fd59a167cc99.jpeg',
    4
  ),
  (
    1431,
    54,
    '5073edb7-c705-4e0d-98e0-99ad2213ecb2.jpeg',
    5
  ),
  (
    1432,
    54,
    '7d493802-8f8b-4c84-9ad6-b05b1c7bb9c4.jpeg',
    6
  ),
  (
    1433,
    73,
    'fa669f86-3229-41c8-9839-58500c5b37b4.jpeg',
    1
  ),
  (
    1434,
    73,
    'ff521c2f-dba7-4b18-af1a-a8836bfa252d.jpeg',
    2
  ),
  (
    1435,
    73,
    'feeedd28-0fbf-4250-b11d-ebf9096a88a5.jpeg',
    3
  ),
  (
    1436,
    73,
    '2140af2b-00dc-4eda-ab41-f683718ad266.jpeg',
    4
  ),
  (
    1437,
    73,
    'ab27bd0a-79e1-49d5-9087-a7624f1de2b4.jpeg',
    5
  ),
  (
    1587,
    79,
    '1998dabf-418c-4b4a-b9ec-90b8703cdae6.jpeg',
    1
  ),
  (
    1588,
    79,
    '5c3c7a5a-b5e0-4947-83c8-15cebb87cfe2.jpeg',
    2
  ),
  (
    1589,
    79,
    '1365c763-5b4c-449d-9fce-e59fc653b4dc.jpeg',
    3
  ),
  (
    1590,
    79,
    '716bac46-3723-45fa-991a-440b55004a25.jpeg',
    4
  ),
  (
    1637,
    81,
    '3994b81d-f37d-4de9-81c4-35d54d862c69.jpeg',
    1
  ),
  (
    1638,
    81,
    '78eb1f4c-aef4-4160-a5bd-1985e387ef87.jpeg',
    2
  ),
  (
    1639,
    81,
    '5300ce13-ea03-44d4-9f9e-eb4ae8f171cd.jpeg',
    3
  ),
  (
    1640,
    81,
    '7380a1f2-4e51-47bc-9c81-88106d910c3e.jpeg',
    4
  ),
  (
    1641,
    81,
    '4a3b7935-2df3-4902-9505-bdf1b72ad561.jpeg',
    5
  ),
  (
    1899,
    134,
    '647a53f4-d841-4db4-bb9f-b9c391f199a6.jpeg',
    1
  ),
  (
    1900,
    134,
    '71eb8203-8681-44d2-aa69-9591418cc65a.jpeg',
    2
  ),
  (
    1901,
    134,
    '49662a66-1f12-4a8c-a09f-e9f846414698.jpeg',
    3
  ),
  (
    1902,
    134,
    '50562863-ef08-4653-bef6-61f07a4d30d3.jpeg',
    4
  ),
  (
    1903,
    134,
    '44aee0f3-bb9d-4424-99d2-43156f6045e8.jpeg',
    5
  ),
  (
    1904,
    134,
    'fbbbac65-c8a3-4228-abe2-efffeac8cdcd.jpeg',
    6
  ),
  (
    1905,
    134,
    '0a0f8071-73b1-4f6c-a3f2-6e373163a658.jpeg',
    7
  ),
  (
    1906,
    134,
    'c9ba9247-4fe2-4e06-b606-29700bed4401.jpeg',
    8
  ),
  (
    1907,
    134,
    'c77386f8-339a-42e6-8df9-70669258eb20.jpeg',
    9
  ),
  (
    1908,
    134,
    'f9994e6b-d2c8-4063-ba70-d9360c482297.jpeg',
    10
  ),
  (
    1909,
    135,
    'cba52ee0-a607-4422-9b4b-b63aa4841082.jpeg',
    1
  ),
  (
    1910,
    135,
    '20de6951-8f54-4c4b-97a6-61bc93b44f19.jpeg',
    2
  ),
  (
    1911,
    135,
    '0e022813-2d18-46bc-8ca7-11385dfd62f9.jpeg',
    3
  );

SELECT
  setval(
    pg_get_serial_sequence('photo', 'id'),
    (
      SELECT
        MAX(id)
      FROM
        photo
    )
  );

INSERT INTO
  shoot_model (shoot_id, model_id)
VALUES
  (134, 1),
  (9, 7),
  (14, 13),
  (15, 14),
  (20, 19),
  (44, 41),
  (54, 54),
  (81, 62),
  (62, 63),
  (48, 65),
  (73, 68),
  (79, 69),
  (135, 82);

INSERT INTO
  shoot_photographer (shoot_id, photographer_id)
VALUES
  (9, 5),
  (14, 7),
  (15, 7),
  (20, 7),
  (54, 11),
  (79, 11),
  (44, 17),
  (48, 17),
  (62, 20),
  (81, 25),
  (134, 25),
  (73, 27),
  (135, 37);

INSERT INTO
  shoot_tag (shoot_id, tag_id)
VALUES
  (14, 8),
  (20, 8),
  (135, 8),
  (54, 9),
  (81, 9),
  (134, 9),
  (9, 10),
  (15, 10),
  (44, 10),
  (54, 10),
  (62, 10),
  (79, 10),
  (81, 10),
  (135, 10),
  (20, 11),
  (81, 11),
  (54, 12),
  (134, 12),
  (79, 16),
  (48, 17),
  (73, 18);