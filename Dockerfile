FROM oven/bun:1.1.8-debian as base

# Create an app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./

# Run the bun install
RUN bun install

# Bundle app source
COPY . .

EXPOSE 3000

CMD ["bun", "run", "preview"]