function Environment() {
  process.env.NODE_ENV = 'production';
  this.INFLUX_URL = 'http://10.232.229.155:8086/';
  this.INFLUX_TOKEN = 'Dwu2vyFmBTOFSGF1VF7JkDteY554MxPpw7euRhcA4x8snb1gAkDbfA8hk32HNLZbss_UZS7xcdF1octkmBtCnQ==';
  this.INFLUX_ORG = 'trz';
  this.INFLUX_BUCKET = 'trz_pems';
}

module.exports = new Environment();