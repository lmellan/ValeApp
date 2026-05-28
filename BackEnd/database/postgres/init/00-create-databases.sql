CREATE USER vale_user WITH PASSWORD 'vale_pass';
CREATE USER usuario_user WITH PASSWORD 'usuario_pass';
CREATE USER audit_user WITH PASSWORD 'audit_pass';
CREATE USER configuracion_user WITH PASSWORD 'configuracion_pass';
CREATE USER casino_user WITH PASSWORD 'casino_pass';

CREATE DATABASE vale_db OWNER vale_user;
CREATE DATABASE usuario_db OWNER usuario_user;
CREATE DATABASE audit_db OWNER audit_user;
CREATE DATABASE configuracion_db OWNER configuracion_user;
CREATE DATABASE casino_db OWNER casino_user;
