lang: Java
subsystem: jsm

```java
public class main
{
    public static void main(String[] args)
    {
        System.setSecurityManager(new SecurityManager());
        /* SECURE */
        System.out.println("Hello, world!");
    }
}
```
