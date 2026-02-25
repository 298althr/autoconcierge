FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

# Copy the standalone build from the host
# Ensure 'npm run build' was run on the host first
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

EXPOSE 3001

CMD ["node", "server.js"]
