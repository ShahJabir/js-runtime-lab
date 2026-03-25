#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
  for (int i = 0; i < argc; i++)
  {
    printf("Argument %d: %s\n", i, argv[i]);
  }
  printf("C Process ID: %d\n", getpid());
  printf("C Parent Process ID: %d\n", getppid());
  printf("Mode in C is: %s\n", getenv("MODE"));
  return 0;
}
