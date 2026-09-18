import { http, HttpResponse } from "msw";
import { db, DEMO_USER, type ApiActor } from "./db";

const json = <T,>(data: T, status = 200) =>
  HttpResponse.json(data, { status });

function paginateActors(url: URL) {
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("page_size") || 20);
  let items = [...db.actores];

  const nombre = url.searchParams.get("nombre");
  if (nombre) {
    items = items.filter((a) =>
      a.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  }
  const categoriaId = url.searchParams.get("categoria_id");
  if (categoriaId) {
    items = items.filter((a) => a.categoria_id === Number(categoriaId));
  }
  const organizacionId = url.searchParams.get("organizacion_id");
  if (organizacionId) {
    items = items.filter((a) => a.organizacion_id === Number(organizacionId));
  }
  const cargoId = url.searchParams.get("cargo_id");
  if (cargoId) {
    items = items.filter((a) => a.cargo_id === Number(cargoId));
  }
  const nivelPoder = url.searchParams.get("nivel_poder");
  if (nivelPoder) {
    items = items.filter((a) => a.nivel_poder === nivelPoder);
  }
  const nivel = url.searchParams.get("nivel");
  if (nivel) {
    items = items.filter((a) => a.nivel === nivel);
  }
  const relacion = url.searchParams.get("relacion");
  if (relacion) {
    items = items.filter((a) => a.relacion === relacion);
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    items: pageItems,
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
  };
}

function crudListGet(path: string, collection: () => unknown[]) {
  return [
    http.get(path, () => json(collection())),
    http.get(`${path}:id`, ({ params }) => {
      const item = (collection() as Array<{ id: number }>).find(
        (x) => x.id === Number(params.id)
      );
      if (!item) return json({ detail: "Not found" }, 404);
      return json(item);
    }),
    http.post(path, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const list = collection() as Array<Record<string, unknown>>;
      const id = Math.max(0, ...list.map((x) => Number(x.id))) + 1;
      const created = { id, ...body };
      list.push(created);
      return json(created, 201);
    }),
    http.put(`${path}:id`, async ({ params, request }) => {
      const list = collection() as Array<Record<string, unknown>>;
      const idx = list.findIndex((x) => x.id === Number(params.id));
      if (idx < 0) return json({ detail: "Not found" }, 404);
      const body = (await request.json()) as Record<string, unknown>;
      list[idx] = { ...list[idx], ...body, id: list[idx].id };
      return json(list[idx]);
    }),
    http.delete(`${path}:id`, ({ params }) => {
      const list = collection() as Array<{ id: number }>;
      const idx = list.findIndex((x) => x.id === Number(params.id));
      if (idx < 0) return json({ detail: "Not found" }, 404);
      list.splice(idx, 1);
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}

export const handlers = [
  // Auth
  http.post("/auth/login", async ({ request }) => {
    const body = (await request.json()) as {
      correo?: string;
      contrasena?: string;
    };
    if (
      body.correo === DEMO_USER.correo &&
      body.contrasena === DEMO_USER.password
    ) {
      db.session = {
        id: DEMO_USER.id,
        nombre: DEMO_USER.nombre,
        correo: DEMO_USER.correo,
      };
      return new HttpResponse(null, { status: 204 });
    }
    // Any credentials work in demo mode for convenience
    db.session = {
      id: DEMO_USER.id,
      nombre: DEMO_USER.nombre,
      correo: body.correo || DEMO_USER.correo,
    };
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/auth/signup", async ({ request }) => {
    const body = (await request.json()) as {
      nombre: string;
      correo: string;
    };
    db.session = { id: 2, nombre: body.nombre, correo: body.correo };
    return json(db.session, 201);
  }),

  http.post("/auth/refresh", () => {
    if (!db.session) return json({ detail: "Unauthorized" }, 401);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/auth/logout", () => {
    db.session = null;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/auth/me", () => {
    if (!db.session) {
      // Auto-session for first visit convenience
      db.session = {
        id: DEMO_USER.id,
        nombre: DEMO_USER.nombre,
        correo: DEMO_USER.correo,
      };
    }
    return json(db.session);
  }),

  // Actors
  http.get("/api/v1/actores/", ({ request }) => {
    return json(paginateActors(new URL(request.url)));
  }),
  http.get("/api/v1/actores/:id", ({ params }) => {
    const actor = db.actores.find((a) => a.id === Number(params.id));
    if (!actor) return json({ detail: "Not found" }, 404);
    return json(actor);
  }),
  http.post("/api/v1/actores/", async ({ request }) => {
    const body = (await request.json()) as Partial<ApiActor>;
    const actor: ApiActor = {
      id: db.nextActorId++,
      nombre: body.nombre || "Sin nombre",
      categoria_id: Number(body.categoria_id) || 1,
      organizacion_id: body.organizacion_id ? Number(body.organizacion_id) : null,
      cargo_id: body.cargo_id ? Number(body.cargo_id) : null,
      celular: body.celular ?? null,
      correo: body.correo ?? null,
      observaciones: body.observaciones ?? null,
      relacion: body.relacion ?? null,
      nivel_poder: body.nivel_poder ?? null,
      nivel: body.nivel ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.actores.push(actor);
    return json(actor, 201);
  }),
  http.put("/api/v1/actores/:id", async ({ params, request }) => {
    const idx = db.actores.findIndex((a) => a.id === Number(params.id));
    if (idx < 0) return json({ detail: "Not found" }, 404);
    const body = (await request.json()) as Partial<ApiActor>;
    db.actores[idx] = {
      ...db.actores[idx],
      ...body,
      id: db.actores[idx].id,
      updated_at: new Date().toISOString(),
    };
    return json(db.actores[idx]);
  }),
  http.delete("/api/v1/actores/:id", ({ params }) => {
    const idx = db.actores.findIndex((a) => a.id === Number(params.id));
    if (idx < 0) return json({ detail: "Not found" }, 404);
    db.actores.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Catalogs
  ...crudListGet("/api/v1/categorias/", () => db.categorias),
  ...crudListGet("/api/v1/cargos/", () => db.cargos),
  ...crudListGet("/api/v1/distritos/", () => db.distritos),
  ...crudListGet("/api/v1/municipios/", () => db.municipios),
  ...crudListGet("/api/v1/organizaciones/", () => db.organizaciones),
  ...crudListGet("/api/v1/tipos-organizaciones/", () => db.tiposOrganizaciones),

  // Excel import stubbed for demo
  http.post("/api/v1/importar-excel/validar", () =>
    json({
      detail: "Importación deshabilitada en la demo de portafolio",
    }, 501)
  ),
  http.post("/api/v1/importar-excel/commit", () =>
    json({ detail: "Importación deshabilitada en la demo" }, 501)
  ),
];
