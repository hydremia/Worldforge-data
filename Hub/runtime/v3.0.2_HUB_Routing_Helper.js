// v3.0.2 helper: build starters from config
export async function buildStartersFromConfig(config, context='top_level') {
  const ctx = config.contexts?.[context] || config.contexts?.top_level || {buttons:[], overflow:[]};
  const visible = (ctx.buttons || []).slice(0, (config.ui?.max_visible ?? 4));
  return { visible, overflow: ctx.overflow || [] };
}
