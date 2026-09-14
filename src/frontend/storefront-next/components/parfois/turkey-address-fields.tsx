"use client";

import { useQuery } from "@tanstack/react-query";
import { useT } from "@/lib/i18n/dil";
import { useMemo } from "react";
import type { TurkeyAddressSelection, TrTown } from "@/lib/tr-address";

const selectClass =
  "w-full border border-[#e5e5e5] bg-white px-3 py-3 text-[12px] outline-none focus:border-black disabled:bg-[#fafafa] disabled:text-[#999]";

const inputClass =
  "w-full border border-[#e5e5e5] px-3 py-3 text-[12px] outline-none focus:border-black";

type TurkeyAddressFieldsProps = {
  value: TurkeyAddressSelection;
  onChange: (value: TurkeyAddressSelection) => void;
  streetLabel?: string;
  streetPlaceholder?: string;
};

async function fetchProvinces() {
  const res = await fetch("/api/address/provinces");
  if (!res.ok) throw new Error("İller yüklenemedi");
  const json = (await res.json()) as { provinces: { name: string }[] };
  return json.provinces;
}

async function fetchTowns(province: string) {
  const res = await fetch(`/api/address/towns?province=${encodeURIComponent(province)}`);
  if (!res.ok) throw new Error("İlçeler yüklenemedi");
  const json = (await res.json()) as { towns: TrTown[] };
  return json.towns;
}

export function TurkeyAddressFields({
  value,
  onChange,
  streetLabel = "Street address",
  streetPlaceholder = "Street, building no, flat",
}: TurkeyAddressFieldsProps) {
  const t = useT();
  const { data: provinces = [], isLoading: provincesLoading } = useQuery({
    queryKey: ["tr-provinces"],
    queryFn: fetchProvinces,
    staleTime: Infinity,
  });

  const { data: towns = [], isLoading: townsLoading } = useQuery({
    queryKey: ["tr-towns", value.province],
    queryFn: () => fetchTowns(value.province),
    enabled: Boolean(value.province),
    staleTime: Infinity,
  });

  const districts = useMemo(() => {
    const town = towns.find((t) => t.name === value.town);
    return town?.districts ?? [];
  }, [towns, value.town]);

  const patch = (partial: Partial<TurkeyAddressSelection>) => {
    onChange({ ...value, ...partial });
  };

  const onProvinceChange = (province: string) => {
    onChange({ province, town: "", district: "", streetLine: value.streetLine, zip: "" });
  };

  const onTownChange = (town: string) => {
    onChange({ ...value, town, district: "", zip: "" });
  };

  const onDistrictChange = (district: string) => {
    const zip = districts.find((d) => d.name === district)?.zip ?? "";
    onChange({ ...value, district, zip });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block sm:col-span-1">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-[#999]">{t("Province")}</span>
        <select
          required
          value={value.province}
          disabled={provincesLoading}
          onChange={(e) => onProvinceChange(e.target.value)}
          className={selectClass}
        >
          <option value="">{provincesLoading ? t("Loading…") : t("Select province")}</option>
          {provinces.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block sm:col-span-1">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-[#999]">{t("District")}</span>
        <select
          required
          value={value.town}
          disabled={!value.province || townsLoading}
          onChange={(e) => onTownChange(e.target.value)}
          className={selectClass}
        >
          <option value="">
            {!value.province ? t("Select a province first") : townsLoading ? t("Loading…") : t("Select district")}
          </option>
          {towns.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block sm:col-span-2">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-[#999]">{t("Neighbourhood")}</span>
        <select
          required
          value={value.district}
          disabled={!value.town || districts.length === 0}
          onChange={(e) => onDistrictChange(e.target.value)}
          className={selectClass}
        >
          <option value="">
            {!value.town ? t("Select a district first") : districts.length === 0 ? t("No neighbourhoods") : t("Select neighbourhood")}
          </option>
          {districts.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block sm:col-span-2">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-[#999]">{t(streetLabel)}</span>
        <input
          required
          type="text"
          value={value.streetLine}
          onChange={(e) => patch({ streetLine: e.target.value })}
          placeholder={t(streetPlaceholder)}
          className={inputClass}
        />
      </label>

      <label className="block sm:col-span-1">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-[#999]">{t("Postal code")}</span>
        <input
          required
          type="text"
          readOnly
          value={value.zip}
          placeholder={t("Filled in when you pick a neighbourhood")}
          className={`${inputClass} bg-[#fafafa] text-[#666]`}
        />
      </label>
    </div>
  );
}
