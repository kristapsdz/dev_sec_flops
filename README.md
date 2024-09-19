
## Adding new subsystems

To add an entirely new subsystem, edit [subsystems.json](subsystems.json) as follows:

```typescript
{
    "NAME_OF_SUBSYSTEM": {
        "deprecated": null, /* Or a string containing deprecation information. */
        "link": "https://canonical/link/to/subsystem/overview",
        "sources": [
            "https://ALL/sources/we...",
            "https://need/to/understand...",
            "https://and/implement/this...",
            "https://in/our/code",
        ]
    }
}

```

That's all.

## Adding new source code examples

Modify the [sources](sources) directory to add specific code examples.
In this, I've included example text that the `system` (operating system)
is `FreeBSD`, although you should omit it if there's no specific
operating system such as with Java; `lang` is `C/C++` and must be set;
the `system-link` may be excluded if your operating system has no
canonical URL explaining it (weird); and `notes` may be empty as well.

The `githubAttestations` let us demonstrate systems using the
combination of source and 

```markdown
lang: C/C++
system: FreeBSD
system-link: https://LINK/TO/OPERATING/SYSTEM/OR/EMPTY
subsystem: NAME_OF_SUBSYSTEM
notes: Any possible notes or just leave this out.
githubAttestations: 
    GITHUBNAME examplename/examplerepo,
    GITHUBNAME2 examplename2/examplerepo2,

` ` `LANGUAGE
int
main(void)
{
}
` ` `
```

## Adding a new attestation to a given system/subsystem

Have you implemented a software sandbox matching an operating system,
language, and sandbox system?  Or you have made a considerable
contribution to one?  Time to show off.

In the [sources](sources) directory, find your match.  (If it doesn't
exist, create it as documented above, please!)

Then add a line or lines to the `githubAttestations`, then make a pull
request with the modifications.  If your sources aren't on GitHub (e.g.,
Sourcehut, etc.), please open an issue and I'll add bits for it.

```
githubAttestations:
   GITHUBNAME examplename/examplerepo[/exampledir],
```

For example, `kristapsdz kristapsdz/kcgi,` (note the trailing comma).
If your repository has, for example, many directories with separate
sandboxes, have those follow the repository.



