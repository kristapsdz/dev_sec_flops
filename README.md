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
implemented a system with this?  Please let me know.

There's way to much hand-waving about software sandboxing.  Let's put
some numbers down.

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

Please put your new attestation at the beginning of the list.  It makes
merging the PR easier.

I will be double-checking that you actually contributed... don't fib.

## Adding new subsystems

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

That's all.

Subsystems I know about but haven't been mentioned for lack of
knowledge: illumos and Solaris privileges.

## Adding new source code examples

Do you have new examples you'd like to list?  It's easy to add them.
Add your example to the [sources](sources) directory to do so, then add
that to the [Makefile](Makefile) and open a pull request.

In this example, I've included example text that the `system` (operating
system) is `FreeBSD`, although you should omit it if there's no specific
operating system such as with Java; `lang` is `C/C++` and must be set;
the `system-link` may be excluded if your operating system has no
canonical URL explaining it (weird); and `notes` may be empty as well.

The `githubAttestations` let us demonstrate actual systems using the
example.  See the above section on adding attestations.  I'll use myself
as an example in this.

```markdown
lang: C/C++
system: FreeBSD
system-link: https://LINK/TO/OPERATING/SYSTEM/OR/EMPTY
subsystem: NAME_OF_SUBSYSTEM
notes: Any possible notes or just leave this out entirely.
githubAttestations: 
    kristapsdz kristapsdz/sblg,
    kristapsdz kristapsdz/lowdown,

` ` `LANGUAGE
int
main(void)
{
}
` ` `
```
