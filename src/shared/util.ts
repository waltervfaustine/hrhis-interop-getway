/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export const isFailedResponse = (r: any) =>
  r?.statusMessage?.statusCode === 'FAIL' ||
  r?.statusCode === 'FAIL' ||
  (!!r?.errors &&
    typeof r.errors === 'object' &&
    Object.keys(r.errors).length > 0);

export function updateEventDataValues(
  event: any,
  updates: Array<{ dataElement: string; value: string }>,
) {
  const m = new Map<string, any>(
    (event.dataValues || []).map((dv: any) => [dv.dataElement, dv]),
  );
  updates.forEach((u) =>
    m.set(u.dataElement, { dataElement: u.dataElement, value: u.value }),
  );
  return { ...event, dataValues: [...m.values()] };
}
