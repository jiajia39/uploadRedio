function Environment() {
  this.NODE_ENV = 'development';

  this.HOST = process.env.HOST || '0.0.0.0';

  this.PORT = 3000;

  this.INFLUX_URL = 'https://iad.raopc.com:7086/';

  this.INFLUX_TOKEN =
    'qk4OpqZDAlEQyghsz1Ef6Xw-bPvXsb1P1eCfpv83vtjVXe7zmlMYkTXmDLzMipzldY6wTnyoG4MMAQyAiWMOXg==';

  this.INFLUX_ORG = 'trz';

  this.INFLUX_BUCKET = 'trz_pems';
}

module.exports = new Environment();
