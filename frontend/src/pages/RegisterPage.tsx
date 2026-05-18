import { Button, Card, Input, Select } from "../components";

function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center">
      <Card className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">Register</h1>
          <p className="mt-1 text-sm text-slate-600">Account creation will be connected later.</p>
        </div>
        <div className="space-y-4">
          <Input label="Name" name="name" placeholder="Your name" />
          <Input label="Email" name="email" placeholder="you@example.com" type="email" />
          <Input label="Password" name="password" placeholder="Password" type="password" />
          <Select
            label="Role"
            name="role"
            options={[
              { label: "Sales", value: "sales" },
              { label: "Admin", value: "admin" },
            ]}
          />
          <Button className="w-full">Register</Button>
        </div>
      </Card>
    </div>
  );
}

export { RegisterPage };

