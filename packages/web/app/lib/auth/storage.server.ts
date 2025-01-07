import { createCookieSessionStorage } from "react-router";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
	throw new Error("SESSION_SECRET must be set");
}

export const storage = createCookieSessionStorage({
	cookie: {
		name: "data_studio_session",
		secure: process.env.NODE_ENV === "production",
		secrets: [sessionSecret],
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
		httpOnly: true,
	},
});

export async function getSession(request: Request) {
	return storage.getSession(request.headers.get("Cookie"));
}