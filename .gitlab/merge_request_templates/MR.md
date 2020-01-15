## Summary/TL;DR
> Write shortest possible summary of issue


---
## Close issues
> * List all issues to close when MR is merged.
> * To trigger auto close, link issues preceded by "Closes". See [docs](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)


---
## Detailed description
> * Description should explain briefly how it works / what it does
> * Write detailed and formated sentences for better readability. For instance, use line breaks and bullet lists
> * Instead of copying description from technical issue, write only extra/missing information
> * You can link to ~Spec issue(s) if it helps


---
## Tests
> * Description should explain how to tests the MR.
> * An ordered list of steps is a good way to describe a test.


---
## Screenshots|Schemas|Code samples
> Paste json schemas/examples when related to API or Data model


---
## :boom: :rotating_light: Breaking changes
> Remove block and title if no breaking change


---
## :exclamation: Tips
> Do not forget to add labels

> Remove all blockquotes when template is filled

/wip
> Wip status signals that this MR is not ready for review yet. Remove wip status only after all conditions are passed

> When MR is created, `Cut/Paste` "Removing wip status" section from description and insert a comment with it.

> Use `// @FIXME` as a comment over code you didn't have time to optimize/improve and think it should be tracked and changed later

> When reviewing, Copy/Paste "Review checklist" and insert a comment describing your review

> When reviewing, if prerequisites are not all OK, just postpone your review and ping back the assignee

---
## Removing wip status
```
* [ ] I created a comment containing this section
* [ ] I filled the description template, then removed blockquotes
* [ ] I read each change file by file, line by line :imp:
* [ ] Commits follow rules
* [ ] Source branch is up-to-date compared to target branch
* [ ] Environment is running
* [ ] Pipeline was successful
* [ ] All changes are related only to referenced issues
* [ ] Browser console is clean
* [ ] I considered if my changes can impact the plugin and if so, I have tested it
* [ ] I considered adding internationalization
* [ ] I considered updating migrate/hydra/???
* [ ] I considered refactoring code to avoid duplication
* [ ] I added unit tests (if applicable)
* [ ] I updated api docs (if applicable)
* [ ] Link to spec issues is OK (reachable through closed issues link or copied if needed)
* [ ] I documented breaking changes :boom: :rotating_light: (if applicable)
```

---
## Review checklist
```
* Prerequisites
  * [ ] No rebase needed at the time of my review
  * [ ] Pipeline is successful at the time of my review
* Functional
  * [ ] I ran the project, MR scope is working
  * [ ] Functional requirements are followed
* Architecture quality
  * [ ] Formalisms/rules are respected
  * [ ] No dead code added
  * [ ] Naming is consistent (files, components, classes, functions, variables, etc.)
  * Code coherence
    * [ ] Clear, clean and readable code
    * [ ] Separation of concerns
    * [ ] Code behaviour is self-explanatory or has comments to explain
  * [ ] No refactor needed
* [ ] `// @FIXME` code reviewed and changes are planned (if applicable)
```


---
## Post merge checklist
```
* [ ] I add the new features added in the QA sheet
```