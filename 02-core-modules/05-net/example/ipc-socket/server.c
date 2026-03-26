#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/un.h>

#define SOCKET_PATH "/tmp/node_c_socket"

void printHex(const char *data, size_t length)
{
  for (size_t i = 0; i < length; i++)
  {
    printf("%02X ", (unsigned char)data[i]);
  }
  printf("\n");
}

int main()
{
  // Create a socket
  int serverSocket = socket(AF_UNIX, SOCK_STREAM, 0);

  if (serverSocket == -1)
  {
    fprintf(stderr, "Socket creation failed");
    exit(1);
  }

  // Set up server address
  struct sockaddr_un serverAddr;
  serverAddr.sun_family = AF_UNIX;
  strcpy(serverAddr.sun_path, SOCKET_PATH);

  // Unlink the socket path to ensure it's not already in use
  unlink(SOCKET_PATH);

  // Bind the socket to the server address
  if (bind(serverSocket, (struct sockaddr *)&serverAddr, sizeof(serverAddr)) == -1)
  {
    fprintf(stderr, "Socket binding failed");
    close(serverSocket);
    exit(1);
  }

  // Listen for incoming connections
  if (listen(serverSocket, 5) == -1)
  {
    fprintf(stderr, "Socket listening failed");
    close(serverSocket);
    exit(1);
  }

  printf("Server is listening...\n");

  while (1)
  {
    // Accept a connection
    int clientSocket = accept(serverSocket, NULL, NULL);

    if (clientSocket == -1)
    {
      fprintf(stderr, "Socket accepting failed");
      close(serverSocket);
      exit(1);
    }

    // Read data from the client
    char buffer[100];
    ssize_t bytesRead = read(clientSocket, buffer, sizeof(buffer));

    if (bytesRead > 0)
    {
      printHex(buffer, bytesRead);
      fflush(stdout);
    }

    // Close the client socket
    // close(clientSocket);
  }

  // Close the server socket
  close(serverSocket);

  exit(0);
}
