CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE recaidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  data DATETIME NOT NULL,
  descricao TEXT,
  quantidade INT NOT NULL,
  tempo TIME NOT NULL, -- tempo perdido, ex: "30min", "1h"
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE quase_recaidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  data DATE NOT NULL,
  hora TIME,
  texto TEXT, -- descrição do momento crítico, gatilhos, etc.
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

  INSERT INTO usuarios (email, senha) VALUES (
  'teste@teste.com',
  '$2y$10$3SsrR.8BgONwrMT6Z2v8mOFEo4O2xsD9qPkwH.kuSsGgJwPztQxLe'
);