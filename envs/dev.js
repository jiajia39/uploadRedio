function Environment() {
  this.NODE_ENV = 'development';
  this.INFLUX_URL = 'https://iad.raopc.com:7086/';
  this.INFLUX_TOKEN = 'kVAfPlHgzR-ssVptzXffkej9cBxxge4zCOOW7aGl9eCVniMlbnyyctMnnvHKMYLxdPVKL9tBMp3V-CbLyrid1g==';
  this.INFLUX_ORG = 'trz';
  this.INFLUX_BUCKET = 'L85PEMS';
}

module.exports = new Environment();