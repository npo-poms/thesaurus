

```bash
mvn release:branch -DbranchName=REL-5.13-SNAPSHOT -DdevelopmentVersion=5.14-SNAPSHOT
git checkout REL-5.13-SNAPSHOT
mvn -Pvpro-nexus release:prepare release:perform -DreleaseVersion=5.13.0 -DdevelopmentVersion=5.13.1-SNAPSHOT
```
