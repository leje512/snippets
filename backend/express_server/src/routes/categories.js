import Router from "express-promise-router";
import validate from "../schema/validate.js";
import categorySchema from "../schema/category-schema.js";
import categoryDB from "../db/categories.js";
import { isAuthorized } from "../util/auth.js";
import { refreshToken } from "./auth.js";
import { request } from "express";

const categories = Router();

categories.get("/", async (req, res) => {
    const { status, result } = await categoryDB.getCategories();
    res.status(status).json(result);
});

categories.post("/", isAuthorized, validate({ body: categorySchema }), refreshToken, async (req, res) => {
    const { status, result } = await categoryDB.postCategory(req.body),
    proxy = req.headers["x-forwarded-host"],
    host = proxy ? proxy : req.headers.host;
    res
        .set("Location", `${req.protocol}://${host}${req.baseUrl}/${result.id}`)
        .status(status)
        .json(result);
});

categories.get("/:id", async (req, res) => {
    const { status, result } = await categoryDB.getCategories(req.params.id);

  if (status === 200) {
    res.status(status).json(result);
  } else {
    res.sendStatus(status);
  }
});

export { categories, categorySchema };

export default { categories, categorySchema };