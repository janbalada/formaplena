function ejecutarTemporal() {
  const en = FormApp.openById(PropertiesService.getScriptProperties().getProperty('FORM_ALTA_EN')), it = en.getItems();
  const R = { 1: 'No', 3: 'prueba.idioma@example.com', 5: 'PRUEBA Idioma EN', 6: '+447911123456', 7: '1995-05-10', 8: 'Woman', 9: 'Lose fat', 10: '165', 11: '60',
    12: 'Beginner (less than 6 months)', 13: 'At home', 14: ['Lack of time'], 16: 'No', 17: ['None'], 18: ['Knee'], 19: 'Recovered, but sometimes bothers me', 20: ['Running or jumping'],
    21: 'No', 22: 'Regular cycle', 24: ['Monday', 'Wednesday', 'Friday'], 25: '45–60 min', 26: ['Dumbbells', 'Resistance bands'], 28: '4', 29: ['None'], 30: 'I eat everything',
    31: ['None, I eat everything'], 32: 'Menu with options to choose from', 34: '7', 35: ['None'], 39: ['I agree'], 40: ['I agree'], 41: ['I agree'] };
  const irs = Object.keys(R).map(function (k) { const item = it[+k]; return { getItem: function () { return item; }, getResponse: function () { return R[k]; } }; });
  const orig = FormApp.openById(FORM_ID), antes = orig.getResponses().length;
  altaTraducida({ source: en, response: { getItemResponses: function () { return irs; } } });
  Utilities.sleep(40000);
  const rs = orig.getResponses(), ult = rs[rs.length - 1];
  const txt = ult.getItemResponses().map(function (x) { const v = x.getResponse(); return x.getItem().getTitle().slice(0, 30) + '=' + (Array.isArray(v) ? v.join('/') : v); }).join(' | ');
  const cl = SpreadsheetApp.openById('17U5K2Pjh3u9aj5NCdPumwOll-chACK9AinAz1k10wmU').getSheetByName('Clientes').getDataRange().getValues().filter(function (f) { return String(f[1]).indexOf('PRUEBA Idioma') === 0; }).map(function (f) { return f[0] + ' ' + f[1] + ' ' + f[8]; });
  Logger.log('TEST antes=' + antes + ' despues=' + rs.length + ' clientes=' + JSON.stringify(cl) + ' RESP ' + txt);
}
