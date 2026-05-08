# Bitcoin Testnet4 Node - Latest Version
FROM ubuntu:22.04
LABEL maintainer="Bitcoin Testnet4 Faucet"

# Install dependencies
RUN apt-get update && \
    apt-get install --yes \
    make \
    wget \
    curl \
    ca-certificates

# Create non-root user
RUN adduser --disabled-login --gecos "" tester

# Set working directory
WORKDIR /home/tester

# Bitcoin Core 27.0 with Testnet4 support
ENV BITCOIN_CORE_VERSION "27.0"

# Download and install Bitcoin Core
RUN mkdir tmp && \
    cd tmp && \
    wget "https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_CORE_VERSION}/bitcoin-${BITCOIN_CORE_VERSION}-x86_64-linux-gnu.tar.gz" && \
    tar xzf "bitcoin-${BITCOIN_CORE_VERSION}-x86_64-linux-gnu.tar.gz" && \
    cd "bitcoin-${BITCOIN_CORE_VERSION}/bin" && \
    install --mode 755 --target-directory /usr/local/bin * && \
    cd /home/tester && \
    rm -r tmp

# Copy testnet-box files
ADD . /home/tester/bitcoin-testnet-box

# Set permissions
RUN chown -R tester:tester /home/tester/bitcoin-testnet-box

# Setup bashrc
RUN if [ -f /home/tester/bitcoin-testnet-box/.bashrc ]; then \
    mv /home/tester/bitcoin-testnet-box/.bashrc /home/tester/ && \
    cat /home/tester/.bashrc >> /etc/bash.bashrc; \
    fi

# Use tester user
USER tester

# Set working directory
WORKDIR /home/tester/bitcoin-testnet-box

# Expose RPC ports
EXPOSE 19001 19011

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD bitcoin-cli -testnet getblockchaininfo || exit 1

CMD ["/bin/bash"]
