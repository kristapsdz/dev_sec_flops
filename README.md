# Introduction

This is a repository for a survey on source code sandboxing in the wild.
It's still in progress.

*Please don't post this repository for broader consumption until it's
ready, thank you!*  However, if you want to contribute attestations or
subsystems, please do.

An **attestation** means that **you** have used a software sandbox
(e.g., [pledge](https://man.openbsd.org/pledge)) in your software.  This
means that you personally interfaced with the sandbox subsystem or made
a significant contribution.  Please let me know using the documentation
below!  Make your work known.

A **subsystem** is a software sandbox system like
[pledge](https://man.openbsd.org/pledge).  I've documented a handful in
this repository, but there are more.
[illumos](https://www.illumos.org/) folks, I'm looking at you: I know
about [privileges(7)](https://illumos.org/man/7/privileges).  Have you
implemented a system with this?  Please let me know.  All the ones
mentioned are in [subsystems.json](subsystems.json).

Lastly, a **system** is an operating system like OpenBSD or Linux.  All
the ones mentioned are in [systems.json](systems.json).

Anywaym, there's way to much hand-waving about software sandboxing.
Let's put some numbers down.

## Adding a new attestation to a given system/subsystem

Have you implemented a software sandbox matching an operating system,
language, and sandbox system?  Or you have made a considerable
contribution to one?  Time to show off.

In the [sources](sources) directory, find your match.  (If it doesn't
exist, create it as documented above, please!)

Then add a line or lines to the `githubAttestations`, then make a pull
request with the modifications.  If the project is in GitHub, no need to
include the domain; if it isn't, then use the full path to your sources.
If you don't have a GitHub account (e.g., you're using Sourceforge),
then please open an issue and I'll address that later.

```
githubAttestations:
   GITHUBNAME examplename/examplerepo[/exampledir],
   GITHUBNAME2 https://your.domain/examplerepo[/exampledir],
```

For example, `kristapsdz kristapsdz/kcgi,` (note the trailing comma).
If your repository has, for example, many directories with separate
sandboxes, have those follow the repository.

Please put your new attestation at the beginning of the list.  It makes
merging the PR easier.

I will be double-checking that you actually contributed... don't fib.

## Adding new systems and subsystems

To add an entirely new subsystem, edit
[subsystems.json](subsystems.json) as follows:

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

Same goes with [systems.json](systems.json), except easier:

```typescript
{
    "NAME_OF_SYSTEM": {
        "link": "https://canonical/link/to/system/overview"
    }
}

```

That's all.

Subsystems I know about but haven't been mentioned for lack of
knowledge: Illumos and Solaris privileges.

## Adding new source code examples

Do you have new examples you'd like to list?  It's easy to add them.
Add your example to the [sources](sources) directory to do so, then open
a pull request.

In this example, I've included example text that the `system` (operating
system) is `FreeBSD`, although you should omit it if there's no specific
operating system such as with Java; `lang` is `C/C++` and must be set;
and `notes` may be empty as well.

The `githubAttestations` let us demonstrate actual systems using the
example.  See the above section on adding attestations.  I'll use myself
as an example in this.

```markdown
lang: C/C++
system: freebsd
subsystem: NAME_OF_SUBSYSTEM
notes: Any possible notes or just leave this out entirely.
githubAttestations: 
    kristapsdz kristapsdz/sblg,
    kristapsdz kristapsdz/lowdown,

` ` `LANGUAGE
int
main(void)
{
    do_the_security();
    /* SECURE. */
    puts("Hello, world!");
}
` ` `
```
