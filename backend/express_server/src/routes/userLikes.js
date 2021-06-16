import Router from "express-promise-router";
import validate from "../schema/validate.js";
import userLikeSchema from "../schema/userLike-schema.js";
import userLikesDB from "../db/userLikes.js";
import { isAuthorized } from "../util/auth.js";
import { refreshToken } from "./auth.js";

const userLikes = Router();

userLikes.get("/", async (req, res) => {
  const { status, result } = await userLikesDB.getLikes(req.query.search);
  res.status(status).json(result);
});

userLikes.post( "/", isAuthorized, validate({ body: userLikeSchema }), refreshToken, async (req, res) => {
  const { status, result } = await userLikesDB.postLike(req.body),
    proxy = req.header["x-forwarded-host"],
    host = proxy ? proxy : req.headers.host;
  res
    .set("Location", `${req.protocol}://${host}${req.baseUrl}/${result.id}`)
    .status(status)
    .json(result);
});

userLikes.get("/:id", async (req, res) => {
  const { status, result } = await userLikesDB.getLike(req.params.id);

  if (status === 200) {
    res.status(status).json(result);
  } else {
    res.sendStatus(status);
  }
});

userLikes.delete("/:id", isAuthorized, refreshToken, async (req, res) => {
  let like = { status: "", result: "" };
  like = await userLikesDB.getLike(req.params.id);

  if (req.id !== like.result.user_id) {
    return res.sendStatus(401);
  }
  like = await userLikesDB.deleteLike(req.params.id);
  res.status(like.status).json(like.result);
});

export { userLikes, userLikeSchema };

export default { userLikes, userLikeSchema };
