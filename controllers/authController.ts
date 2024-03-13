import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import bcrypt from "bcrypt";
import jwt, { Secret, VerifyErrors } from "jsonwebtoken";

interface UserInfo {
  username: string;
  roles: string[];
}

// @desc Login
// @route POST /auth
// @access Public
const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const foundUser: IUser | null = await User.findOne({
    username,
  }).exec();
  if (!foundUser || !foundUser.active || foundUser === null) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const match: boolean = await bcrypt.compare(password, foundUser!.password);

  if (!match) res.status(401).json({ message: "Unauthorized" });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser!.username,
        roles: foundUser!.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { username: foundUser!.username },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "7d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "none", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  // Send accessToken containing username and roles
  res.json({ accessToken });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = async (req: Request, res: Response): Promise<void> => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const refreshToken: string = cookies.jwt;
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as jwt.JwtPayload;
    if (typeof decoded === "string") {
      throw new Error("Invalid token payload");
    }

    const foundUser = await User.findOne({
      username: decoded.username,
    }).exec();

    if (!foundUser) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: foundUser.roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET as Secret,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Forbidden" });
  }
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Cookie cleared" });
};

export default { login, refresh, logout };
