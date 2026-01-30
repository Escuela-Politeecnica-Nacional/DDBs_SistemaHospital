# Test DELETE /api/doctores/:id

## Command:
```bash
curl -X DELETE \
  'http://localhost:4000/api/doctores/1?sede=1' \
  -H 'Content-Type: application/json'
```

## Expected Behavior:
- If the `id` and `sede` are valid, the doctor should be deleted, and a success response should be returned.
- If the `id` or `sede` is invalid, an appropriate error message should be returned.

## Notes:
- Replace `1` in the URL with the actual `id` of the doctor to delete.
- Ensure the backend server is running on `localhost:4000`.