"use client";

import { useEffect, useState, useCallback } from "react";
import { Button, TextInput, Select, Table, Card, Text, Icon } from "@gravity-ui/uikit";
import { Plus, TrashBin } from "@gravity-ui/icons";
import { getApiBaseUrl } from "@/lib/deployment-config";

const API_URL = getApiBaseUrl();

/**
 * Category tree management for admins/staff. Talks directly to the
 * Express API (credentials: "include" so the Better Auth session
 * cookie — set by the web app's own /api/auth routes — rides along;
 * apps/api/src/lib/auth.js verifies it on every write).
 *
 * NOTE: Gravity UI component props here follow its standard public API
 * as of this writing — since this container has no internet access to
 * `npm install` and verify against the installed version, double-check
 * `Table`/`Select` prop names once you run `npm install` locally. If a
 * prop has been renamed upstream, the fix is usually a 1-line change.
 */
export default function AdminCategoriesPage() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newMainName, setNewMainName] = useState("");
  const [selectedMainId, setSelectedMainId] = useState(null);
  const [newSubName, setNewSubName] = useState("");
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [newBrandName, setNewBrandName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/categories`);
      const json = await res.json();
      setTree(json.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function apiCall(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`);
    return json;
  }

  async function addMain() {
    if (!newMainName.trim()) return;
    await apiCall("/categories", {
      method: "POST",
      body: JSON.stringify({ name: newMainName.trim(), level: 0 }),
    });
    setNewMainName("");
    load();
  }

  async function addSub() {
    if (!newSubName.trim() || !selectedMainId) return;
    await apiCall("/categories", {
      method: "POST",
      body: JSON.stringify({ name: newSubName.trim(), level: 1, parentId: selectedMainId }),
    });
    setNewSubName("");
    load();
  }

  async function addBrand() {
    if (!newBrandName.trim() || !selectedSubId) return;
    await apiCall(`/categories/${selectedSubId}/brands`, {
      method: "POST",
      body: JSON.stringify({ name: newBrandName.trim() }),
    });
    setNewBrandName("");
    load();
  }

  async function removeBrand(subId, brandSlug) {
    await apiCall(`/categories/${subId}/brands/${brandSlug}`, { method: "DELETE" });
    load();
  }

  async function softDelete(id) {
    await apiCall(`/categories/${id}`, { method: "DELETE" });
    load();
  }

  const mainOptions = tree.map((m) => ({ value: m._id, content: m.name }));
  const selectedMain = tree.find((m) => m._id === selectedMainId);
  const subOptions = (selectedMain?.subcategories || []).map((s) => ({ value: s._id, content: s.name }));

  const columns = [
    { id: "name", name: "নাম" },
    { id: "type", name: "টাইপ" },
    { id: "brands", name: "ব্র্যান্ড" },
    { id: "actions", name: "" },
  ];

  const rows = tree.flatMap((main) => [
    { id: main._id, name: main.name, type: "Main Category", brands: "—", actions: main },
    ...(main.subcategories || []).map((sub) => ({
      id: sub._id,
      name: `— ${sub.name}`,
      type: "Subcategory",
      brands: (sub.brands || []).map((b) => b.name).join(", ") || "—",
      actions: sub,
    })),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">ক্যাটাগরি ও ব্র্যান্ড ম্যানেজমেন্ট</h1>

      {error && (
        <Card view="outlined" className="mb-4 p-3 text-red-600">
          {error} — লগইন করা admin/staff সেশন লাগবে (Better Auth) লেখা/মোছার জন্য।
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card view="outlined" className="p-4">
          <Text variant="subheader-2">নতুন Main Category</Text>
          <div className="mt-3 flex gap-2">
            <TextInput value={newMainName} onUpdate={setNewMainName} placeholder="যেমন: Robotics" />
            <Button view="action" onClick={addMain}>
              <Icon data={Plus} /> যোগ করুন
            </Button>
          </div>
        </Card>

        <Card view="outlined" className="p-4">
          <Text variant="subheader-2">নতুন Subcategory</Text>
          <div className="mt-3 space-y-2">
            <Select
              placeholder="Main Category বাছুন"
              options={mainOptions}
              value={selectedMainId ? [selectedMainId] : []}
              onUpdate={(v) => setSelectedMainId(v[0] || null)}
            />
            <div className="flex gap-2">
              <TextInput value={newSubName} onUpdate={setNewSubName} placeholder="যেমন: Handheld Fan" />
              <Button view="action" onClick={addSub}>
                <Icon data={Plus} /> যোগ করুন
              </Button>
            </div>
          </div>
        </Card>

        <Card view="outlined" className="p-4">
          <Text variant="subheader-2">Subcategory-তে নতুন ব্র্যান্ড</Text>
          <div className="mt-3 space-y-2">
            <Select
              placeholder="Main Category বাছুন"
              options={mainOptions}
              value={selectedMainId ? [selectedMainId] : []}
              onUpdate={(v) => setSelectedMainId(v[0] || null)}
            />
            <Select
              placeholder="Subcategory বাছুন"
              options={subOptions}
              value={selectedSubId ? [selectedSubId] : []}
              onUpdate={(v) => setSelectedSubId(v[0] || null)}
              disabled={!selectedMainId}
            />
            <div className="flex gap-2">
              <TextInput value={newBrandName} onUpdate={setNewBrandName} placeholder="যেমন: Xiaomi" />
              <Button view="action" onClick={addBrand}>
                <Icon data={Plus} /> যোগ করুন
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card view="outlined" className="p-4">
        <Text variant="subheader-2">পূর্ণ ক্যাটাগরি ট্রি ({tree.length} Main, {rows.length - tree.length} Sub)</Text>
        {loading ? (
          <p className="mt-3 text-neutral-500">লোড হচ্ছে...</p>
        ) : (
          <div className="mt-3">
            <Table
              data={rows}
              columns={columns.map((c) =>
                c.id === "actions"
                  ? {
                      ...c,
                      template: (row) => (
                        <Button size="s" view="flat-danger" onClick={() => softDelete(row.actions._id)}>
                          <Icon data={TrashBin} />
                        </Button>
                      ),
                    }
                  : c.id === "brands" && c.id !== "actions"
                  ? {
                      ...c,
                      template: (row) =>
                        row.actions.brands?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {row.actions.brands.map((b) => (
                              <span
                                key={b.slug}
                                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs"
                              >
                                {b.name}
                                <button
                                  onClick={() => removeBrand(row.actions._id, b.slug)}
                                  className="text-neutral-400 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        ),
                    }
                  : c
              )}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
