// v3.1.0 helper: build starters from config
export async function buildStartersFromConfig(config, context='top_level') {
  const ctx = config.contexts?.[context] || config.contexts?.top_level || {buttons:[], overflow:[]};
  const visible = (ctx.buttons || []).slice(0, 4);
  return { visible, overflow: ctx.overflow || [] };
}
