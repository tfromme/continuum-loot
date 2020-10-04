## continuum_loot

This is the name of the project.  Inside are project-wide settings files and configs.

## scripts

This is where any Django scripts will live.<br />
They can be run in a Django context with `python manage.py runscript [name-of-script]`.

## loot

This is the name of the app.  Projects can have many apps, there is only one here.<br />

### models.py

This is where the model definitions live.<br />
They define how the data is saved in the database and referenced in code.

### serializers.py

This is where the models are serialized from a Model into JSON.<br />
These are used by the views to present an API.

### views.py

This is where the API lives.<br />
DRF is supposed to allow this to be more automatic, but right now any update/create API is written manually.<br />
The get APIs are at the top of the file and are quite automatic, using the serializers.<br />
A TODO is to get all of the endpoints (except maybe login/signup) to go through a serializer.

### urls.py

This is where the API is mapped to urls.

### admin.py

This is where the Admin App is configured.

### migrations

This folder is where the auto-generated migrations live.
