export interface Env {
	TWITCH_SECRETS: string;
	CORS_ORIGINS: string;
}

function getCorsAllowedOrigin(request: Request, env: Env) {
	const origin = request.headers.get('origin');
	if (origin && env.CORS_ORIGINS.split(',').includes(origin)) {
		return origin;
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method === 'OPTIONS') {
			// CORS PREFLIGHT
			const isApprovedMethod = request.headers.get('Access-Control-Request-Method') === 'POST';
			if (getCorsAllowedOrigin(request, env) && isApprovedMethod) {
				return new Response(null, {
					status: 204,
					headers: {
						'Access-Control-Allow-Origin': origin,
						'Access-Control-Allow-Methods': 'POST',
						'Access-Control-Max-Age': '86400',
					},
				});
			} else {
				return new Response(null, { status: 403 });
			}
		} else if (request.method === 'POST') {
			// MAIN REQUEST
			const secrets = JSON.parse(env.TWITCH_SECRETS);
			if (request.headers.get('content-type') !== 'application/x-www-form-urlencoded') {
				return new Response(null, { status: 415 });
			}
			const data = await request.formData();
			const clientId = data.get('client_id');
			if (!clientId) {
				return new Response('client_id is required', { status: 400 });
			}
			const clientSecret = secrets[clientId.toString()];
			if (!clientSecret) {
				return new Response('client_id is not a known value', { status: 400 });
			}
			data.set('client_secret', clientSecret);
			const upstream = await fetch('https://id.twitch.tv/oauth2/token', {
				method: 'post',
				body: data,
			});
			const response = new Response(await upstream.text(), { headers: upstream.headers });
			const origin = getCorsAllowedOrigin(request, env);
			if (origin) {
				response.headers.set('Access-Control-Allow-Origin', origin);
			}
			return response;
		}
		return new Response(null, { status: 405 });
	},
};
