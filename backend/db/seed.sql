begin;

truncate table
  checklist_tarea_grupal,
  comentarios_tarea_grupal,
  tareas_grupales,
  integrantes_proyecto,
  proyectos_grupales,
  pasos_proyecto_largo,
  proyectos_largos,
  mensajes_chat,
  notificaciones,
  bloques_planificador,
  examenes,
  tareas,
  cursos,
  estudiantes
restart identity cascade;

insert into estudiantes (
  id,
  nombres,
  apellidos,
  correo,
  hash_contrasena,
  universidad,
  carrera,
  semestre,
  plan,
  tipo_perfil,
  objetivo_academico,
  preferencia_micro_sesion,
  horario_laboral,
  dias_mayor_disponibilidad,
  tiene_tesis_proyecto,
  tiempo_real_disponible_dia,
  horas_disponibles,
  metodo_estudio,
  tono_asistente,
  metas,
  horas_estudio_diarias,
  horas_sueno,
  notif_tareas,
  notif_examenes,
  notif_ia,
  notif_semanal,
  notif_correo,
  app_modo_oscuro,
  app_google_calendar,
  app_sugerencias_automaticas
)
values (
  '00000000-0000-0000-0000-000000000001',
  'Jhan',
  'Perez',
  'jhan.perez@universidad.edu',
  '123456',
  'Universidad Nacional de Ingenieria',
  'Ingenieria de Sistemas',
  '5',
  'estudiante',
  'universitario',
  'aprobar_cursos',
  20,
  null,
  'Lunes a jueves por la tarde',
  false,
  2,
  '4-6',
  'pomodoro',
  'amigable',
  'Mantener un semestre ordenado, avanzar con constancia y llegar a los examenes con un plan claro.',
  4,
  8,
  true,
  true,
  true,
  true,
  false,
  false,
  true,
  true
);

insert into estudiantes (
  id,
  nombres,
  apellidos,
  correo,
  hash_contrasena,
  universidad,
  carrera,
  semestre,
  plan,
  tipo_perfil,
  objetivo_academico,
  preferencia_micro_sesion,
  horario_laboral,
  dias_mayor_disponibilidad,
  tiene_tesis_proyecto,
  tiempo_real_disponible_dia,
  horas_disponibles,
  metodo_estudio,
  tono_asistente,
  metas,
  horas_estudio_diarias,
  horas_sueno,
  notif_tareas,
  notif_examenes,
  notif_ia,
  notif_semanal,
  notif_correo,
  app_modo_oscuro,
  app_google_calendar,
  app_sugerencias_automaticas
)
values
(
  '00000000-0000-0000-0000-000000000002',
  'Mariana',
  'Quispe',
  'posgrado.demo@universidad.edu',
  '123456',
  'Universidad Peruana de Posgrado',
  'Maestria en Gestion de Proyectos',
  '2',
  'premium_plus',
  'posgrado',
  'avanzar_tesis',
  20,
  'Lun-vie 09:00 - 18:00',
  'Martes noche y sabado manana',
  true,
  1.5,
  '1-2',
  'micro-sesiones',
  'responsable',
  'Avanzar tesis sin descuidar trabajo y familia.',
  2,
  7,
  true,
  true,
  true,
  true,
  false,
  false,
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000003',
  'Carlos',
  'Ramos',
  'profesional.demo@universidad.edu',
  '123456',
  'Escuela de Negocios Andina',
  'Diplomado en Analitica de Datos',
  '1',
  'premium_plus',
  'profesional_estudia',
  'organizar_trabajo_estudio',
  30,
  'Turnos variables, reuniones de tarde',
  'Domingo tarde y miercoles noche',
  true,
  1,
  '1-2',
  'bloques-cortos',
  'amigable',
  'Equilibrar entregables laborales y academicos.',
  2,
  7,
  true,
  true,
  true,
  true,
  false,
  false,
  true,
  true
);

insert into cursos (id, estudiante_id, nombre, docente, horario_texto, semestre, color, descripcion)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Base de Datos', 'Dr. Carlos Ramirez', 'Lun, Mie 08:00 - 10:00', '5', 'blue', 'Modelo relacional, SQL, normalizacion y transacciones.'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Programacion II', 'Ing. Maria Lopez', 'Mar, Jue 10:00 - 12:00', '5', 'purple', 'POO, APIs REST, testing y arquitectura de aplicaciones.'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Calculo II', 'Mat. Juan Perez', 'Lun, Mie 14:00 - 16:00', '5', 'green', 'Integrales, series y aplicaciones matematicas.'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Fisica II', 'Dra. Ana Martinez', 'Mar, Vie 08:00 - 10:00', '5', 'red', 'Ondas, electromagnetismo y resolucion de problemas.'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Ingenieria de Software', 'Ing. Roberto Silva', 'Jue 14:00 - 16:00', '5', 'orange', 'Requisitos, historias de usuario, calidad y gestion de proyectos.');

insert into cursos (id, estudiante_id, nombre, docente, horario_texto, semestre, color, descripcion)
values
  ('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', 'Seminario de Tesis', 'Dra. Elena Vargas', 'Sab 09:00 - 12:00', '2', 'teal', 'Diseno metodologico, revision bibliografica y avance de tesis.'),
  ('10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', 'Gestion de Proyectos', 'Mg. Raul Paredes', 'Mie 19:00 - 21:00', '2', 'purple', 'Herramientas para gestionar alcance, tiempo y riesgos.'),
  ('10000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000003', 'Analitica Aplicada', 'Ing. Sofia Leon', 'Vie 20:00 - 22:00', '1', 'blue', 'Casos de negocio, metricas y dashboards ejecutivos.');

insert into tareas (id, estudiante_id, curso_id, titulo, descripcion, fecha_entrega, prioridad, estado, horas_estimadas, progreso)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Proyecto final - Parte 2', 'Completar el modelo logico y las consultas principales del caso final.', current_date + interval '3 day', 'high', 'in-progress', 3, 40),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Implementar API REST', 'Cerrar autenticacion, validaciones y pruebas basicas.', current_date + interval '2 day', 'high', 'pending', 4, 15),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Lista de ejercicios de integrales', 'Resolver y sustentar 12 ejercicios del capitulo 4.', current_date + interval '4 day', 'medium', 'pending', 2.5, 0),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Informe de laboratorio de ondas', 'Redactar resultados, analisis y conclusiones del laboratorio.', current_date + interval '6 day', 'medium', 'in-progress', 2, 55),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Historias de usuario del proyecto', 'Definir backlog inicial, criterios de aceptacion y prioridades.', current_date + interval '5 day', 'high', 'pending', 3.5, 10),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Mapa conceptual de normalizacion', 'Resumir 1FN, 2FN, 3FN y casos practicos.', current_date + interval '1 day', 'medium', 'completed', 1, 100),
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Testing de controladores', 'Escribir pruebas unitarias para los endpoints principales.', current_date + interval '7 day', 'low', 'pending', 2, 0);

insert into examenes (id, estudiante_id, curso_id, titulo, fecha_examen, hora_examen, temas, preparacion)
values
  ('25000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Examen parcial 2', current_date + interval '3 day', '08:00', array['Normalizacion', 'SQL avanzado', 'Transacciones'], 75),
  ('25000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Evaluacion de Programacion', current_date + interval '5 day', '10:00', array['POO', 'API REST', 'Testing'], 60),
  ('25000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Practica calificada', current_date + interval '8 day', '14:00', array['Integrales', 'Series', 'Aplicaciones'], 45),
  ('25000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Control de Fisica II', current_date + interval '11 day', '08:00', array['Electromagnetismo', 'Optica', 'Ondas'], 30);

insert into bloques_planificador (id, estudiante_id, curso_id, dia_semana, hora_inicio, horas_duracion, titulo, tipo_bloque, color)
values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 0, 8, 2, 'Base de Datos', 'class', 'blue'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 1, 10, 2, 'Programacion II', 'class', 'purple'),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 0, 14, 2, 'Calculo II', 'class', 'green'),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 3, 8, 2, 'Fisica II', 'class', 'red'),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 3, 14, 2, 'Ingenieria de Software', 'class', 'orange'),
  ('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 2, 16, 1.5, 'Repaso Base de Datos', 'study', 'blue'),
  ('30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 1, 18, 2, 'Avance API REST', 'study', 'purple'),
  ('30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 4, 16, 1.5, 'Practica de integrales', 'study', 'green'),
  ('30000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', null, 5, 11, 1, 'Descanso activo', 'break', 'yellow');

insert into bloques_planificador (id, estudiante_id, curso_id, dia_semana, hora_inicio, horas_duracion, titulo, tipo_bloque, color)
values
  ('30000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002', null, 0, 9, 8, 'Trabajo', 'work', 'slate'),
  ('30000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', 1, 20, 0.33, 'Micro-sesion: revisar marco teorico', 'micro_session', 'teal'),
  ('30000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', 5, 9, 3, 'Seminario de Tesis', 'class', 'teal'),
  ('30000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000002', null, 4, 18, 1, 'Traslado', 'commute', 'gray'),
  ('30000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000003', null, 2, 9, 7, 'Trabajo por turnos', 'work', 'slate'),
  ('30000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000021', 2, 21, 0.5, 'Micro-sesion: limpiar dataset', 'micro_session', 'blue');

insert into notificaciones (id, estudiante_id, tipo, titulo, mensaje, no_leida)
values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'urgent', 'Tienes 2 examenes esta semana', 'Base de Datos y Programacion II necesitan prioridad de estudio esta semana.', true),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'warning', 'Tu tarea de Programacion vence en 2 dias', 'Implementar API REST sigue en 15%. Te conviene avanzar hoy.', true),
  ('40000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'info', 'Hoy tienes 4 horas sugeridas de estudio', 'La planificacion actual recomienda un bloque para Base de Datos y otro para Programacion II.', true),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'success', 'Completaste una tarea reciente', 'El mapa conceptual de normalizacion ya figura como completado.', false),
  ('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'info', 'Tu curso con mayor carga es Ingenieria de Software', 'Todavia falta avanzar historias de usuario y backlog inicial.', true);

insert into mensajes_chat (id, estudiante_id, rol, mensaje)
values
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ai', 'Hola, Jhan 😊 Todo bien. Ya revise tus cursos, tareas y examenes, asi que de una puedo ayudarte a organizar tu semana, resumir temas o armarte un plan de estudio bacan.'),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'user', 'Que deberia priorizar hoy?'),
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'ai', 'Hoy deberias priorizar Implementar API REST y repasar Base de Datos, porque ambas actividades estan mas cerca y tienen mayor impacto en tu semana.');

insert into proyectos_largos (id, estudiante_id, curso_id, titulo, descripcion, tipo, fecha_limite, fase_actual, progreso, ultimo_avance)
values
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', 'Tesis: productividad en equipos hibridos', 'Proyecto de investigacion para maestria con alta carga laboral.', 'tesis', current_date + interval '45 day', 'redaccion', 35, current_date - interval '6 day'),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000021', 'Caso de negocio con dashboard ejecutivo', 'Entregable final del diplomado conectado a metricas laborales.', 'caso_negocio', current_date + interval '18 day', 'estructura', 25, current_date - interval '4 day');

insert into pasos_proyecto_largo (id, proyecto_id, titulo, fase, completado)
values
  ('61000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Depurar pregunta de investigacion', 'investigacion', true),
  ('61000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', 'Redactar 2 paginas de marco teorico', 'redaccion', false),
  ('61000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000001', 'Revisar citas APA', 'revision', false),
  ('61000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000002', 'Definir indicadores del dashboard', 'estructura', false),
  ('61000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000002', 'Limpiar dataset de ventas', 'investigacion', true);

insert into proyectos_grupales (id, estudiante_id, curso_id, nombre, descripcion, fecha_limite)
values
  ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000012', 'Exposicion: riesgos del proyecto', 'Trabajo grupal con diapositivas, guion y practica.', current_date + interval '12 day'),
  ('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000021', 'Caso grupal de analitica', 'Caso de estudio con tablero y responsables.', current_date + interval '9 day');

insert into integrantes_proyecto (id, proyecto_id, nombre, rol)
values
  ('71000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'Mariana', 'Coordinadora'),
  ('71000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'Rafael', 'Analisis'),
  ('71000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', 'Daniela', 'Diapositivas'),
  ('71000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002', 'Carlos', 'Datos'),
  ('71000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000002', 'Andrea', 'Presentacion');

insert into tareas_grupales (id, proyecto_id, titulo, responsable_id, fecha_limite, estado, progreso)
values
  ('72000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'Investigar riesgos principales', '71000000-0000-0000-0000-000000000002', current_date + interval '3 day', 'en_proceso', 50),
  ('72000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'Armar diapositivas', '71000000-0000-0000-0000-000000000003', current_date + interval '5 day', 'pendiente', 10),
  ('72000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002', 'Limpiar datos base', '71000000-0000-0000-0000-000000000004', current_date + interval '2 day', 'en_revision', 80),
  ('72000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002', 'Preparar historia del caso', '71000000-0000-0000-0000-000000000005', current_date + interval '4 day', 'pendiente', 20);

commit;
