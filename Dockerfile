FROM oven/bun:1.2.10-debian AS base

# Create an app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

# Run the bun install
RUN bun install

# Bundle app source
COPY . ./

# Build the app
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "preview"]
