// test/index.spec.ts
import { env, SELF, fetchMock } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

describe('test errors', () => {
	it('responds with 405 on GET request', async () => {
		const response = await SELF.fetch('https://example.com', { method: 'GET' });
		expect(response.status).equals(405);
	});

	it('responds with 403 on OPTIONS with no origin', async () => {
		const response = await SELF.fetch('https://example.com', { method: 'OPTIONS' });
		expect(response.status).equals(403);
	});

	it('responds with 403 on OPTIONS with wrong origin', async () => {
		const response = await SELF.fetch('https://example.com', {
			method: 'OPTIONS',
			headers: { Origin: 'http://wrong.com' },
		});
		expect(response.status).equals(403);
	});

	it('responds with 200 on OPTIONS with right origin', async () => {
		const response = await SELF.fetch('https://example.com', {
			method: 'OPTIONS',
			headers: { Origin: env.CORS_ORIGINS, 'Access-Control-Request-Method': 'POST' },
		});
		expect(response.status).equals(204);
	});

	it('responds with 415 on missing content type', async () => {
		const response = await SELF.fetch('https://example.com', {
			method: 'POST',
			headers: { Origin: env.CORS_ORIGINS },
		});
		expect(response.status).equals(415);
	});

	it('relays twitch payload by adding secret', async () => {
		fetchMock.activate();
		const response = await SELF.fetch('https://example.com', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: 'client_id=woy7ya6l4610oz5udb3yrv0jt8xq1b'
			+ '&code=gulfwdmys5lsm6qyz4ximz9q32l10'
			+ '&grant_type=authorization_code'
			+ '&redirect_uri=http://localhost:3000'
		})
		expect(response.status).equals(200);
	})
});
