
// 28/11/2026: formularios de alta en catalán e inglés (copias del original, IDs en las propiedades FORM_ALTA_CA y FORM_ALTA_EN).
// Cada respuesta se pasa al formulario original en castellano, así el alta, la ficha y el panel funcionan igual que siempre.
function altaTraducida(e) {
  const src = e.source, orig = FormApp.openById(FORM_ID), T = FormApp.ItemType;
  const si = src.getItems(), oi = orig.getItems(), pos = {};
  si.forEach(function (it, i) { pos[it.getId()] = i; });
  const nueva = orig.createResponse();
  e.response.getItemResponses().forEach(function (ir) {
    const i = pos[ir.getItem().getId()], o = oi[i]; if (!o) return;
    const v = ir.getResponse(), tipo = o.getType();
    try {
      if (tipo === T.MULTIPLE_CHOICE || tipo === T.CHECKBOX) {
        const mc = tipo === T.MULTIPLE_CHOICE;
        const sc = (mc ? si[i].asMultipleChoiceItem() : si[i].asCheckboxItem()).getChoices().map(function (c) { return c.getValue(); });
        const oc = (mc ? o.asMultipleChoiceItem() : o.asCheckboxItem()).getChoices().map(function (c) { return c.getValue(); });
        const conv = function (x) { const k = sc.indexOf(x); return k >= 0 ? oc[k] : x; };
        nueva.withItemResponse(mc ? o.asMultipleChoiceItem().createResponse(conv(v)) : o.asCheckboxItem().createResponse([].concat(v).map(conv)));
      } else if (tipo === T.DATE) {
        const m = String(v).match(/(\d{4})-(\d{1,2})-(\d{1,2})/); if (m) nueva.withItemResponse(o.asDateItem().createResponse(new Date(+m[1], +m[2] - 1, +m[3], 12)));
      } else if (tipo === T.SCALE) nueva.withItemResponse(o.asScaleItem().createResponse(Number(v)));
      else if (tipo === T.PARAGRAPH_TEXT) nueva.withItemResponse(o.asParagraphTextItem().createResponse(String(v)));
      else if (tipo === T.TEXT) nueva.withItemResponse(o.asTextItem().createResponse(String(v)));
    } catch (err) { Logger.log('altaTraducida, pregunta ' + i + ': ' + err); }
  });
  const enviada = nueva.submit();
  CacheService.getScriptCache().put('alta_tr_' + enviada.getId(), '1', 21600);
  crearFicha_(enviada);
}
