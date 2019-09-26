

```bash
mvn release:branch -DbranchName=REL-5.11-SNAPSHOT -DdevelopmentVersion=5.12-SNAPSHOT
git checkout REL-5.11-SNAPSHOT
mvn release:prepare release:perform -DreleaseVersion=5.11.0 -DdevelopmentVersion=5.11.1-SNAPSHOT
```
